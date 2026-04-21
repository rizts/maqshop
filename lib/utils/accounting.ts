import type { SupabaseClient } from '@supabase/supabase-js'

interface CreateJurnalParams {
  supabase: SupabaseClient
  orgId: string
  tanggal: string
  keterangan: string
  refId: string
  refType: 'pos_transaksi' | 'topup' | 'withdrawal' | 'manual'
  dibuatOleh: string
  entries: { kode: string; debet: number; kredit: number }[]
}

export const createJurnal = async ({
  supabase,
  orgId,
  tanggal,
  keterangan,
  refId,
  refType,
  dibuatOleh,
  entries
}: CreateJurnalParams) => {
  // Get COA IDs from kodes
  const kodes = entries.map(e => e.kode)
  const { data: coas, error: coaError } = await supabase
    .from('chart_of_accounts')
    .select('id, kode')
    .eq('org_id', orgId)
    .in('kode', kodes)

  if (coaError || !coas) {
    throw new Error('Failed to fetch COA reference')
  }

  // Generate nomor jurnal
  const nomor = `JRN-${Date.now()}`

  // Create jurnal
  const { data: jurnal, error: jurnalError } = await supabase
    .from('jurnal')
    .insert({
      org_id: orgId,
      tanggal,
      nomor,
      keterangan,
      ref_id: refId,
      ref_type: refType,
      dibuat_oleh: dibuatOleh
    })
    .select('id')
    .single()

  if (jurnalError || !jurnal) {
    throw new Error(`Failed to create jurnal: ${jurnalError?.message}`)
  }

  // Map entries with COA IDs
  const jurnalDetails = entries.map(entry => {
    const coa = coas.find(c => c.kode === entry.kode)
    if (!coa) throw new Error(`COA ${entry.kode} not found`)
    return {
      jurnal_id: jurnal.id,
      coa_id: coa.id,
      debet: entry.debet,
      kredit: entry.kredit
    }
  })

  // Insert details
  const { error: detailError } = await supabase
    .from('jurnal_detail')
    .insert(jurnalDetails)

  if (detailError) {
    throw new Error(`Failed to create jurnal details: ${detailError.message}`)
  }

  return true
}
