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

  const { data: santri, error } = await (supabase
    .from('santri') as any)
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
    .single() as any

  if (error) {
    throw new Error('Failed to create santri: ' + error.message)
  }

  // Create empty tabungan record for the new santri
  if (santri) {
    const { error: tabunganError } = await (supabase
      .from('tabungan') as any)
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

export async function updateSantri(id: string, formData: FormData) {
  const orgSlug = formData.get('orgSlug') as string
  const nis = formData.get('nis') as string
  const full_name = formData.get('full_name') as string
  const gender = formData.get('gender') as string
  const kelas = formData.get('kelas') as string
  const kamar = formData.get('kamar') as string
  const tahun_masuk = formData.get('tahun_masuk')
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  const supabase = await createClient()

  const { error } = await (supabase
    .from('santri') as any)
    .update({
      nis,
      full_name,
      gender,
      kelas,
      kamar,
      tahun_masuk: tahun_masuk ? parseInt(tahun_masuk as string) : null,
      status,
      notes
    })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to update santri: ' + error.message)
  }

  revalidatePath(`/${orgSlug}/santri`)
  revalidatePath(`/${orgSlug}/santri/${id}`)
  redirect(`/${orgSlug}/santri/${id}`)
}

export async function linkGuardian(formData: FormData) {
  const santriId = formData.get('santriId') as string
  const guardianId = formData.get('guardianId') as string
  const relationship = formData.get('relationship') as string
  const orgSlug = formData.get('orgSlug') as string
  const orgId = formData.get('orgId') as string

  const supabase = await createClient()

  const { error } = await (supabase
    .from('guardian_santri') as any)
    .insert({
      santri_id: santriId,
      guardian_id: guardianId,
      relationship,
      org_id: orgId
    })

  if (error) {
    throw new Error('Failed to link guardian: ' + error.message)
  }

  revalidatePath(`/${orgSlug}/santri/${santriId}`)
}

export async function unlinkGuardian(linkId: string, santriId: string, orgSlug: string) {
  const supabase = await createClient()

  const { error } = await (supabase
    .from('guardian_santri') as any)
    .delete()
    .eq('id', linkId)

  if (error) {
    throw new Error('Failed to unlink guardian: ' + error.message)
  }

  revalidatePath(`/${orgSlug}/santri/${santriId}`)
}

export async function importSantriBatch(orgId: string, data: any[]) {
  const supabase = await createClient()
  const results = []

  for (const item of data) {
    try {
      // 1. Insert Santri
      const { data: santri, error } = await (supabase
        .from('santri') as any)
        .insert({
          org_id: orgId,
          nis: item.nis?.toString() || null,
          full_name: item.full_name,
          gender: item.gender,
          kelas: item.kelas || null,
          kamar: item.kamar || null,
          tahun_masuk: item.tahun_masuk ? parseInt(item.tahun_masuk) : new Date().getFullYear(),
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        results.push({ success: false, data: item, reason: error.message })
        continue
      }

      // 2. Create Tabungan
      if (santri) {
        const { error: tabError } = await (supabase
          .from('tabungan') as any)
          .insert({
            org_id: orgId,
            santri_id: santri.id,
            saldo: 0
          })
        
        if (tabError) {
          console.error(`Failed to init tabungan for ${santri.id}:`, tabError)
          // We don't fail the whole import if tabungan fails, but it's bad. 
          // In a real app we'd use a DB trigger for this.
        }
      }

      results.push({ success: true, data: item })
    } catch (e: any) {
      results.push({ success: false, data: item, reason: e.message })
    }
  }

  return results
}
