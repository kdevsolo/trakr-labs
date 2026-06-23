'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

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

function isTermsAccepted(formData: FormData) {
  return formData.get('tncAccepted') === 'on'
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  if (!isTermsAccepted(formData)) {
    return {
      error: 'You must accept the Terms of Service and Privacy Policy.',
    }
  }

  const supabase = await createClient()
  const tncAcceptedAt = new Date().toISOString()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { tnc_accepted_at: tncAcceptedAt },
    },
  })

  if (error) return { error: error.message }

  return { message: 'Check your email to confirm your account.' }
}

export async function updatePassword(formData: FormData) {
  if (!isTermsAccepted(formData)) {
    return {
      error: 'You must accept the Terms of Service and Privacy Policy.',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expired. Please use your invite or reset link again.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  const tncAcceptedAt = new Date().toISOString()
  await supabase.auth.updateUser({
    data: { tnc_accepted_at: tncAcceptedAt },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    try {
      await acceptTerms(session.access_token)
    } catch {
      // User row may not exist yet; metadata is stored for provisioning.
    }
  }

  redirect('/dashboard')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const origin = await getRequestOrigin()
  const redirectTo = `${origin}/auth/callback?next=/auth/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo },
  )

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
  const tncAcceptedAt = cookieStore.get(TNC_ACCEPTED_COOKIE)?.value

  if (!tncAcceptedAt) {
    return
  }

  const supabase = await createClient()
  await supabase.auth.updateUser({
    data: { tnc_accepted_at: tncAcceptedAt },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    try {
      await acceptTerms(session.access_token)
    } catch {
      // User row may not exist yet; metadata is stored for provisioning.
    }
  }

  cookieStore.delete(TNC_ACCEPTED_COOKIE)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
