'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createJurnal } from '@/lib/utils/accounting'

export async function reviewTopupRequest(formData: FormData) {
  const orgId = formData.get('orgId') as string
  const orgSlug = formData.get('orgSlug') as string
  const requestId = formData.get('requestId') as string
  const action = formData.get('action') as 'approve' | 'reject'
  const notes = formData.get('notes') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get request
  const { data: request, error: reqError } = await supabase
    .from('topup_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (reqError || !request || request.status !== 'pending') {
    throw new Error('Request invalid or already processed')
  }

  if (action === 'reject') {
    await supabase
      .from('topup_requests')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes
      })
      .eq('id', requestId)
  } else if (action === 'approve') {
    const jumlah = Number(request.jumlah)

    // 1. Get Tabungan
    const { data: tabungan } = await supabase
      .from('tabungan')
      .select('*')
      .eq('santri_id', request.santri_id)
      .single()

    if (!tabungan) throw new Error('Tabungan not found')

    const saldoSebelum = Number(tabungan.saldo)
    const saldoSesudah = saldoSebelum + jumlah
    const totalDeposit = Number(tabungan.total_deposit) + jumlah

    // 2. Update Request Status First
    const { error: updErr } = await supabase
      .from('topup_requests')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes
      })
      .eq('id', requestId)
      
    if (updErr) throw new Error('Failed to update request status')

    // 3. Update Tabungan
    await supabase
      .from('tabungan')
      .update({
         saldo: saldoSesudah,
         total_deposit: totalDeposit,
         updated_at: new Date().toISOString()
      })
      .eq('id', tabungan.id)

    // 4. Record Transaction
    const { data: trx } = await supabase
      .from('transaksi_tabungan')
      .insert({
        org_id: orgId,
        santri_id: request.santri_id,
        tipe: 'deposit_transfer',
        jumlah: jumlah,
        saldo_sebelum: saldoSebelum,
        saldo_sesudah: saldoSesudah,
        keterangan: 'Top-up Transfer via Ortu/Wali',
        ref_topup_id: requestId,
        dibuat_oleh: user.id
      })
      .select('id')
      .single()

    // 5. Accounting Jurnal
    if (trx) {
      await createJurnal({
          supabase,
          orgId,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: `Approval Top-up Transfer (${request.id})`,
          refId: trx.id,
          refType: 'topup', 
          dibuatOleh: user.id,
          entries: [
            { kode: '1000', debet: jumlah, kredit: 0 },
            { kode: '2000', debet: 0, kredit: jumlah }
          ]
      })
    }
  }

  revalidatePath(`/${orgSlug}/tabungan/topup-requests`)
  revalidatePath(`/${orgSlug}/tabungan`)
}
