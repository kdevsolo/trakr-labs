'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/app/auth/actions'

export default function LoginPage() {
  const [message, setMessage] = useState('')

  async function handleSubmit(action: typeof signIn, formData: FormData) {
    const result = await action(formData)
    if (result?.error) setMessage(result.error)
    if (result?.message) setMessage(result.message)
  }

  return (
    <div>
      <h1>Login</h1>
      <form action={async (fd) => handleSubmit(signIn, fd)}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
        <button type="button" formAction={async (fd) => handleSubmit(signUp, fd)}>
          Sign Up
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}