'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createJurnal } from '@/lib/utils/accounting'

export async function processDeposit(formData: FormData) {
  const orgId = formData.get('orgId') as string
  const orgSlug = formData.get('orgSlug') as string
  const santriId = formData.get('santriId') as string
  const jumlahStr = formData.get('jumlah') as string
  const keterangan = formData.get('keterangan') as string

  if (!orgId || !santriId || !jumlahStr) {
    throw new Error('Missing required fields')
  }

  const jumlah = parseFloat(jumlahStr)
  if (isNaN(jumlah) || jumlah <= 0) {
    throw new Error('Jumlah deposit tidak valid')
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Execute Deposit Transaction (RPC is best for isolation, but we'll do it manually here securely with backend)
  // Fetch current tabungan
  const { data: tabungan, error: tabError } = await (supabase
    .from('tabungan') as any)
    .select('*')
    .eq('santri_id', santriId)
    .single()

  if (tabError || !tabungan) throw new Error('Tabungan tidak ditemukan')

  const saldoSebelum = Number(tabungan.saldo)
  const saldoSesudah = saldoSebelum + jumlah
  const totalDepositSesudah = Number(tabungan.total_deposit) + jumlah

  // 1. Update Tabungan
  const { error: updateError } = await (supabase
    .from('tabungan') as any)
    .update({ 
      saldo: saldoSesudah,
      total_deposit: totalDepositSesudah,
      updated_at: new Date().toISOString()
    })
    .eq('id', tabungan.id)
    .eq('saldo', saldoSebelum) // Optimistic concurrency check

  if (updateError) throw new Error('Gagal update saldo, silahkan coba lagi')

  // 2. Insert Transaksi Log
  const { data: trx, error: trxError } = await (supabase
    .from('transaksi_tabungan') as any)
    .insert({
      org_id: orgId,
      santri_id: santriId,
      tipe: 'deposit_cash', // Assuming direct deposit by admin is cash
      jumlah: jumlah,
      saldo_sebelum: saldoSebelum,
      saldo_sesudah: saldoSesudah,
      keterangan: keterangan || 'Deposit Tunai Langsung',
      dibuat_oleh: user.id
    })
    .select('id')
    .single()

  if (trxError) console.error("Failed to log deposit:", trxError)

  // 3. Auto Accounting Jurnal
  if (trx) {
     try {
        await createJurnal({
          supabase,
          orgId,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: `Deposit Tabungan Santri (${keterangan || 'Tunai'})`,
          refId: trx.id,
          refType: 'manual', 
          dibuatOleh: user.id,
          entries: [
            { kode: '1000', debet: jumlah, kredit: 0 }, // Kas Bertambah (Debit)
            { kode: '2000', debet: 0, kredit: jumlah }  // Kewajiban Tabungan Bertambah (Kredit)
          ]
        })
     } catch (e) {
        console.error("Accounting error:", e)
     }
  }

  revalidatePath(`/${orgSlug}/tabungan`)
  redirect(`/${orgSlug}/tabungan`)
}
