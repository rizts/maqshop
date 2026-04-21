'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileName(formData: FormData): Promise<void> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Not authenticated')
    return
  }

  const fullName = formData.get('full_name')?.toString()
  const orgSlug = formData.get('orgSlug')?.toString()
  
  if (!fullName) {
    console.error('Full name is required')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return
  }

  if (orgSlug) {
    revalidatePath(`/${orgSlug}/profile`)
  }
}

export async function updatePassword(formData: FormData): Promise<void> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Not authenticated')
    return
  }

  const newPassword = formData.get('new_password')?.toString()
  const confirmPassword = formData.get('confirm_password')?.toString()
  const orgSlug = formData.get('orgSlug')?.toString()

  if (!newPassword || newPassword.length < 6) {
    console.error('Password must be at least 6 characters')
    return
  }

  if (newPassword !== confirmPassword) {
    console.error('Passwords do not match')
    return
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Error updating password:', error)
    return
  }

  if (orgSlug) {
    revalidatePath(`/${orgSlug}/profile`)
  }
}
