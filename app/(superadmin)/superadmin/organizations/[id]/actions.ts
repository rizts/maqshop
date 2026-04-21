'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTenantStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  const supabase = await createClient()
  
  // Security check: Must be superadmin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'superadmin') return

  await supabase
    .from('organizations')
    .update({ status })
    .eq('id', id)

  revalidatePath('/superadmin/dashboard')
  revalidatePath(`/superadmin/organizations/${id}`)
}
