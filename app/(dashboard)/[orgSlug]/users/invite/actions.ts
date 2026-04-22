'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

  try {
    // 3. Send Supabase Invitation
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        org_id: orgId,
        role: role
      },
      // Redirect back to login after setting password (configured in Supabase Dashboard)
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
