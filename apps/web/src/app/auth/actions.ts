'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

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
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  // Email confirmation required by default
  return { message: 'Check your email to confirm your account.' }
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin =
    headersList.get('origin') ??
    (host ? `${proto}://${host}` : 'http://localhost:3000')
  const redirectTo = `${origin}/auth/callback`

  console.log('redirectTo', redirectTo)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })

  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
  return { error: 'Could not start sign in.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}