'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSantri(formData: FormData) {
  const orgSlug = formData.get('orgSlug') as string
  const orgId = formData.get('orgId') as string
  const nis = formData.get('nis') as string
  const full_name = formData.get('full_name') as string
  const gender = formData.get('gender') as string
  const kelas = formData.get('kelas') as string
  const kamar = formData.get('kamar') as string
  const tahun_masuk = formData.get('tahun_masuk')

  const supabase = await createClient()

  const { data: santri, error } = await supabase
    .from('santri')
    .insert({
      org_id: orgId,
      nis,
      full_name,
      gender,
      kelas,
      kamar,
      tahun_masuk: tahun_masuk ? parseInt(tahun_masuk as string) : new Date().getFullYear(),
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create santri: ' + error.message)
  }

  // Create empty tabungan record for the new santri
  if (santri) {
    const { error: tabunganError } = await supabase
      .from('tabungan')
      .insert({
        org_id: orgId,
        santri_id: santri.id,
        saldo: 0
      })
      
    if (tabunganError) console.error("Failed to init tabungan:", tabunganError)
  }

  revalidatePath(`/${orgSlug}/santri`)
  redirect(`/${orgSlug}/santri`)
}
