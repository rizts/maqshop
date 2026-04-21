'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createJurnal } from '@/lib/utils/accounting'

export async function processPenarikan(formData: FormData) {
  const orgId = formData.get('orgId') as string
  const orgSlug = formData.get('orgSlug') as string
  const santriId = formData.get('santriId') as string
  const jumlahStr = formData.get('jumlah') as string
  const keterangan = formData.get('keterangan') as string

  if (!orgId || !santriId || !jumlahStr || !keterangan) {
    // Note: Keterangan is WAJIB for penarikan based on requirement
    throw new Error('Keterangan penarikan wajib diisi')
  }

  const jumlah = parseFloat(jumlahStr)
  if (isNaN(jumlah) || jumlah <= 0) {
    throw new Error('Jumlah penarikan tidak valid')
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Execute Withdrawal
  const { data: tabungan, error: tabError } = await supabase
    .from('tabungan')
    .select('*, organizations(settings)')
    .eq('santri_id', santriId)
    .single()

  if (tabError || !tabungan) throw new Error('Tabungan tidak ditemukan')

  const settings = tabungan.organizations?.settings as any || {}
  const saldoSebelum = Number(tabungan.saldo)
  
  // Logic: Checking against settings if withdrawal limit or negative balance is enabled
  if (!settings.allow_negative_balance && saldoSebelum < jumlah) {
    throw new Error(`Saldo tidak mencukupi. Sisa saldo: Rp ${new Intl.NumberFormat('id-ID').format(saldoSebelum)}`)
  }

  // TODO: withdrawal_limit_enabled check on sum of today's withdrawals vs withdrawal_limit_amount

  const saldoSesudah = saldoSebelum - jumlah
  const totalKeluarSesudah = Number(tabungan.total_keluar) + jumlah

  // 1. Update Tabungan
  const { error: updateError } = await supabase
    .from('tabungan')
    .update({ 
      saldo: saldoSesudah,
      total_keluar: totalKeluarSesudah,
      updated_at: new Date().toISOString()
    })
    .eq('id', tabungan.id)
    .eq('saldo', saldoSebelum) // Optimistic concurrency

  if (updateError) throw new Error('Gagal update saldo, silahkan coba lagi')

  // 2. Insert Transaksi Log
  const { data: trx, error: trxError } = await supabase
    .from('transaksi_tabungan')
    .insert({
      org_id: orgId,
      santri_id: santriId,
      tipe: 'withdrawal', 
      jumlah: jumlah,
      saldo_sebelum: saldoSebelum,
      saldo_sesudah: saldoSesudah,
      keterangan: keterangan, // WAJIB
      dibuat_oleh: user.id
    })
    .select('id')
    .single()

  if (trxError) console.error("Failed to log withdrawal:", trxError)

  // 3. Auto Accounting Jurnal
  if (trx) {
     try {
        await createJurnal({
          supabase,
          orgId,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: `Penarikan Tabungan Santri: ${keterangan}`,
          refId: trx.id,
          refType: 'withdrawal', 
          dibuatOleh: user.id,
          entries: [
            { kode: '2000', debet: jumlah, kredit: 0 }, // Kewajiban Tabungan Berkurang (Debit)
            { kode: '1000', debet: 0, kredit: jumlah }  // Kas Keluar (Kredit)
          ]
        })
     } catch (e) {
        console.error("Accounting error:", e)
     }
  }

  revalidatePath(`/${orgSlug}/tabungan`)
  redirect(`/${orgSlug}/tabungan`)
}
