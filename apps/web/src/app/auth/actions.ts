'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  RequestPasswordResetSchema,
  SignInSchema,
  SignUpSchema,
  UpdatePasswordSchema,
} from '@trakr/schemas'

import { acceptTerms } from '@/lib/api/users'
import { createClient } from '@/lib/supabase/server'

const TNC_ACCEPTED_COOKIE = 'tnc_accepted_at'

async function getRequestOrigin() {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  return (
    headersList.get('origin') ??
    (host ? `${proto}://${host}` : 'http://localhost:3000')
  )
}

function formatZodError(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const fieldErrors = error.flatten().fieldErrors
  const firstError = Object.values(fieldErrors).flat().find(Boolean)
  return firstError ?? 'Validation failed'
}

export async function signIn(formData: FormData) {
  const parsed = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const parsed = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    tncAccepted: formData.get('tncAccepted') === 'on' ? true : false,
  })

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const supabase = await createClient()
  const cookieStore = await cookies()
  cookieStore.set(TNC_ACCEPTED_COOKIE, new Date().toISOString(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 86_400,
    path: '/',
  })

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { error: error.message }

  return { message: 'Check your email to confirm your account.' }
}

export async function updatePassword(formData: FormData) {
  const parsed = UpdatePasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    tncAccepted: formData.get('tncAccepted') === 'on' ? true : false,
  })

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expired. Please use your invite or reset link again.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) return { error: error.message }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    try {
      await acceptTerms(session.access_token)
    } catch {
      // User row may not exist yet; terms will be accepted on next API call.
    }
  }

  redirect('/dashboard')
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = RequestPasswordResetSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const supabase = await createClient()
  const origin = await getRequestOrigin()
  const redirectTo = `${origin}/auth/callback?next=/auth/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  })

  if (error) return { error: error.message }

  return {
    message: 'If an account exists for that email, we sent a password reset link.',
  }
}

export async function signInWithOAuth(
  provider: 'google' | 'github',
  options?: { termsAccepted?: boolean; requireTerms?: boolean },
) {
  if (options?.requireTerms && !options.termsAccepted) {
    return {
      error: 'You must accept the Terms of Service and Privacy Policy.',
    }
  }

  if (options?.termsAccepted) {
    const cookieStore = await cookies()
    cookieStore.set(TNC_ACCEPTED_COOKIE, new Date().toISOString(), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
  }

  const supabase = await createClient()
  const origin = await getRequestOrigin()
  const redirectTo = `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })

  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
  return { error: 'Could not start sign in.' }
}

export async function persistTermsAcceptance() {
  const cookieStore = await cookies()

  if (!cookieStore.get(TNC_ACCEPTED_COOKIE)?.value) {
    return
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    try {
      await acceptTerms(session.access_token)
    } catch {
      // User row may not exist yet; cookie retained for a later attempt.
      return
    }
  }

  cookieStore.delete(TNC_ACCEPTED_COOKIE)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
