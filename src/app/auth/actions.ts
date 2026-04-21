'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { loginSchema, signupSchema } from '@/lib/validations'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = Object.fromEntries(formData)
  
  const result = loginSchema.safeParse(data)
  if (!result.success) {
    const message = (result.error as any).errors[0].message
    redirect(`/auth/login?message=${encodeURIComponent(message)}`)
  }

  const { email, password } = result.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/auth/login?message=Invalid email or password')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const rawData = Object.fromEntries(formData)
  
  const result = signupSchema.safeParse(rawData)
  if (!result.success) {
    const message = (result.error as any).errors[0].message
    redirect(`/auth/signup?message=${encodeURIComponent(message)}`)
  }

  const { email, password, firstName, lastName, charityId, plan, charityPct } = result.data
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: `${firstName} ${lastName}`.trim(),
        charity_id: charityId,
        charity_pct: charityPct,
        plan: plan,
      },
    },
  })

  if (error) {
    redirect(`/auth/signup?message=${encodeURIComponent(error.message)}`)
  }

  // If we have a user, handle profile data
  if (data.user) {
    // Force an upsert to ensure even if the trigger hasn't finished, the data is there
    // This uses a robust set of data from the form
    const { error: profileError } = await supabase.from('profiles').upsert({
       id: data.user.id,
       email: email,
       full_name: `${firstName} ${lastName}`.trim(),
       charity_id: charityId,
       charity_pct: charityPct,
       plan: plan,
       sub_status: 'inactive'
    })

    if (profileError) {
      console.error('Error updating profile during signup:', profileError)
    }

    // If email confirmation is disabled, Supabase returns a session immediately
    // In this case, we SHOULD NOT redirect to login, but go straight to dashboard
    if (data.session) {
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  }

  // Fallback for when email confirmation IS required
  redirect('/auth/login?message=Check email to continue sign in process')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!email) {
    redirect('/auth/forgot-password?message=Email is required')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  })

  if (error) {
    redirect(`/auth/forgot-password?message=${encodeURIComponent(error.message)}`)
  }

  redirect('/auth/login?message=Check your email for a password reset link')
}

export async function confirmResetToken(formData: FormData) {
  const supabase = await createClient()
  const token_hash = formData.get('token_hash') as string

  if (!token_hash) {
    redirect(`/auth/auth-code-error`)
  }

  const { error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token_hash,
  })

  if (error) {
    redirect(`/auth/auth-code-error`)
  }

  redirect('/auth/update-password')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  // Note: Password strength is also enforced on the frontend form
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect(`/auth/update-password?message=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
