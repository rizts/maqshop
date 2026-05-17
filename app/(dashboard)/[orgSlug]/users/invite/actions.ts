'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Role, Division } from '@/types'

export async function inviteUser(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // 1. Verify current user authorization
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('role, org_id')
    .eq('id', currentUser.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    throw new Error('Unauthorized to invite users')
  }

  // 2. Extract and validate data
  const orgSlug = formData.get('orgSlug') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as Role
  const division = formData.get('division') as Division
  const orgId = formData.get('orgId') as string

  if (!fullName || !email || !role || !orgId) {
    return { error: 'Semua field wajib diisi' }
  }

  // Determine origin dynamically
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`
  const redirectTo = `${origin}/auth/callback?from=/auth/set-password`

  try {
    // 3. Send Supabase Invitation
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        org_id: orgId,
        role: role
      },
      redirectTo: redirectTo
    })

    if (inviteError) throw inviteError

    // 4. Create Profile entry
    // Usually auth.admin.inviteUserByEmail doesn't automatically create a public.profiles entry 
    // unless you have a trigger. If no trigger, we create it manually.
    const { error: profileError } = await (adminSupabase
      .from('profiles') as any)
      .insert({
        id: inviteData.user.id,
        org_id: orgId,
        full_name: fullName,
        role: role,
        division: division,
        is_active: true // Or false until they accept
      })

    if (profileError) {
      console.error('Error creating profile after invite:', profileError)
      // We don't necessarily throw here if the user was invited, 
      // but the UI should know.
    }

    revalidatePath(`/${orgSlug}/users`)
    return { success: true }
  } catch (error: any) {
    console.error('Invitation error:', error)
    return { error: error.message || 'Gagal mengirim undangan' }
  }
}

export async function deleteInvitedUser(userId: string, orgSlug: string) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // 1. Verify current user authorization
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('role, org_id')
    .eq('id', currentUser.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    throw new Error('Unauthorized to delete users')
  }

  // 2. Ensure target user belongs to the same org
  const { data: targetProfile } = await (supabase
    .from('profiles') as any)
    .select('org_id')
    .eq('id', userId)
    .single()

  if (!targetProfile || targetProfile.org_id !== profile.org_id) {
    throw new Error('User not found or not in your organization')
  }

  try {
    // 3. Delete from auth.users (will cascade delete the public.profiles row)
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)
    if (error) throw error

    revalidatePath(`/${orgSlug}/users`)
    return { success: true }
  } catch (error: any) {
    console.error('Delete user error:', error)
    let errorMessage = error.message || 'Gagal menghapus pengguna'
    
    const errStr = String(errorMessage).toLowerCase()
    if (errStr.includes('foreign key') || errStr.includes('violates') || errStr.includes('constraint')) {
      errorMessage = 'Tidak dapat menghapus pengguna ini karena datanya terhubung dengan riwayat transaksi, jurnal, wali santri, atau data penting lainnya.'
    }
    
    return { error: errorMessage }
  }
}

export async function resendInviteEmail(userId: string) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // 1. Verify current user authorization
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('role, org_id')
    .eq('id', currentUser.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    throw new Error('Unauthorized to resend invites')
  }

  // 2. Ensure target user belongs to the same org
  const { data: targetProfile } = await (supabase
    .from('profiles') as any)
    .select('org_id')
    .eq('id', userId)
    .single()

  if (!targetProfile || targetProfile.org_id !== profile.org_id) {
    throw new Error('User not found or not in your organization')
  }

  // 3. Get user email from auth
  const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId)
  if (authError || !authUser.user.email) {
    throw new Error('Could not fetch user email')
  }

  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`
  const redirectTo = `${origin}/auth/callback?from=/auth/set-password`

  try {
    // inviteUserByEmail resends the invite if the user exists and hasn't logged in
    const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(authUser.user.email, {
      redirectTo: redirectTo
    })

    if (inviteError) {
      // Sometimes inviteUserByEmail fails if user is already verified. 
      // If it fails, fallback to generateLink or just throw.
      throw inviteError
    }

    return { success: true }
  } catch (error: any) {
    console.error('Resend invitation error:', error)
    return { error: error.message || 'Gagal mengirim ulang undangan' }
  }
}
