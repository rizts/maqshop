'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTenantSettings(formData: FormData) {
  const orgId = formData.get('orgId') as string
  const orgSlug = formData.get('orgSlug') as string
  const name = formData.get('name') as string
  const address = formData.get('address') as string

  // Settings object construction
  const currentSettingsRaw = formData.get('currentSettings') as string
  const currentSettings = currentSettingsRaw ? JSON.parse(currentSettingsRaw) : {}
  
  const newSettings = {
    ...currentSettings,
    withdrawal_limit_enabled: formData.has('withdrawal_limit_enabled'),
    withdrawal_limit_amount: Number(formData.get('withdrawal_limit_amount')),
    withdrawal_limit_interval: formData.get('withdrawal_limit_interval'),
    low_balance_threshold: Number(formData.get('low_balance_threshold')),
    allow_negative_balance: formData.has('allow_negative_balance'),
  }

  const supabase = await createClient()

  // Ensure security: the user must be admin of this org or superadmin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, org_id')
    .eq('id', user.id)
    .single()

  if (!profile) return
  if (profile.role !== 'admin' && profile.role !== 'superadmin') return
  if (profile.role === 'admin' && profile.org_id !== orgId) return

  // Update
  await supabase
    .from('organizations')
    .update({
      name,
      address,
      settings: newSettings
    })
    .eq('id', orgId)

  revalidatePath(`/${orgSlug}/settings`)
  revalidatePath(`/${orgSlug}/dashboard`)
}
