'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitTopupRequest(formData: FormData) {
  const orgSlug = formData.get('orgSlug') as string
  const santriId = formData.get('santriId') as string
  const jumlahStr = formData.get('jumlah') as string
  const catatan = formData.get('catatan') as string

  if (!santriId || !jumlahStr) {
    throw new Error('Semua field wajib diisi')
  }

  const jumlah = parseFloat(jumlahStr)
  if (isNaN(jumlah) || jumlah <= 0) {
    throw new Error('Jumlah tidak valid')
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get Profile
  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single() as any
  if (!profile || !profile.org_id) throw new Error('Profile invalid')

  const orgId = profile.org_id

  // Verify that the santri is indeed linked to this guardian
  const { data: relationship } = await supabase
    .from('guardian_santri')
    .select('id')
    .eq('guardian_id', user.id)
    .eq('santri_id', santriId)
    .single() as any

  if (!relationship) {
    throw new Error('Anda tidak memiliki otoritas untuk akun santri ini')
  }

  const buktiFile = formData.get('bukti') as File | null
  let buktiUrl = ''
  
  if (buktiFile && buktiFile.size > 0) {
    const fileExt = buktiFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    const { error: uError } = await supabase.storage
      .from('receipts')
      .upload(fileName, buktiFile)
    
    if (uError) {
      console.error('Upload error:', uError)
      throw new Error('Gagal upload bukti transfer: ' + uError.message)
    }

    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
    buktiUrl = urlData.publicUrl
  } else {
    throw new Error('Bukti transfer wajib di-upload')
  }

  // Insert Request
  const { error } = await (supabase
    .from('topup_requests') as any)
    .insert({
      org_id: orgId,
      santri_id: santriId,
      pengaju_id: user.id,
      jumlah,
      bukti_url: buktiUrl,
      catatan
    })

  if (error) {
    throw new Error('Failed to submit request: ' + error.message)
  }

  revalidatePath(`/${orgSlug}/ortu`)
  redirect(`/${orgSlug}/ortu/dashboard`)
}
