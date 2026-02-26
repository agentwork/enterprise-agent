'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, LoginInput } from '../types'

export async function login(input: LoginInput) {
  // 1. Validate input
  const result = loginSchema.safeParse(input)
  if (!result.success) {
    return {
      success: false,
      error: "Invalid input",
    }
  }

  const { email, password } = result.data
  const supabase = await createClient()

  // 2. Authenticate with Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  // 3. Revalidate and Redirect
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
