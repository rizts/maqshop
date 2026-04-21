'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createJurnal } from '@/lib/utils/accounting'

type CartItem = {
  id: string
  nama: string
  harga: number
  qty: number
}

export async function processCheckout(formData: FormData) {
  const orgSlug = formData.get('orgSlug') as string
  const orgId = formData.get('orgId') as string
  const santriId = formData.get('santriId') as string
  const cartJson = formData.get('cart') as string

  if (!orgId || !santriId || !cartJson) {
    throw new Error('Data tidak lengkap')
  }

  const items: CartItem[] = JSON.parse(cartJson)
  if (items.length === 0) throw new Error('Keranjang kosong')

  const total = items.reduce((acc, item) => acc + (item.harga * item.qty), 0)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Check Tabungan and Limits
  const { data: tabungan } = await supabase
    .from('tabungan')
    .select('*, organizations(settings)')
    .eq('santri_id', santriId)
    .single()

  if (!tabungan) throw new Error('Tabungan tidak ditemukan')

  const settings = tabungan.organizations?.settings as any || {}
  const saldoSebelum = Number(tabungan.saldo)

  if (!settings.allow_negative_balance && saldoSebelum < total) {
    throw new Error(`Saldo tidak mencukupi. Sisa saldo: Rp ${new Intl.NumberFormat('id-ID').format(saldoSebelum)}`)
  }

  // Calculate HPP (Harga Pokok Penjualan) for Journal
  let hpp = 0

  // 2. Insert POS Transaction Master
  const { data: trx, error: trxError } = await supabase
    .from('pos_transaksi')
    .insert({
      org_id: orgId,
      santri_id: santriId,
      total: total,
      metode_bayar: 'deposit',
      status: 'success',
      kasir_id: user.id
    })
    .select('id')
    .single()

  if (trxError) throw new Error('Gagal rekam transaksi POS')

  const posId = trx.id

  // 3. Process Items: Deduct Stok, Insert Detail, Calculate HPP
  for (const item of items) {
    // Get cost price
    const { data: prod } = await supabase.from('produk').select('harga_beli, stok').eq('id', item.id).single()
    const itemTotalBeli = (prod?.harga_beli || 0) * item.qty
    hpp += itemTotalBeli

    // Insert detail
    await supabase.from('pos_transaksi_detail').insert({
      pos_id: posId,
      produk_id: item.id,
      qty: item.qty,
      harga_satuan: item.harga,
      subtotal: item.harga * item.qty
    })

    // Deduct stock if there is stock management logic required
    if (prod && prod.stok !== null) {
      await supabase.from('produk').update({ stok: prod.stok - item.qty }).eq('id', item.id)
    }
  }

  // 4. Deduct Tabungan Balance
  const saldoSesudah = saldoSebelum - total
  await supabase
    .from('tabungan')
    .update({ 
      saldo: saldoSesudah,
      total_keluar: Number(tabungan.total_keluar) + total,
      updated_at: new Date().toISOString()
    })
    .eq('id', tabungan.id)

  // 5. Insert Transaksi Tabungan Log
  const { data: mutasi } = await supabase
    .from('transaksi_tabungan')
    .insert({
      org_id: orgId,
      santri_id: santriId,
      tipe: 'pos_payment',
      jumlah: total,
      saldo_sebelum: saldoSebelum,
      saldo_sesudah: saldoSesudah,
      keterangan: `Pembelanjaan Maqshof (#${posId.split('-')[0]})`,
      dibuat_oleh: user.id
    })
    .select('id')
    .single()

  // 6. Accounting Journal
  // Debit Hutang Tabungan (2000), Kredit Penjualan (4000)
  // Debit HPP (5000), Kredit Persediaan (1100)
  if (mutasi) {
     try {
       await createJurnal({
         supabase, orgId,
         tanggal: new Date().toISOString().split('T')[0],
         keterangan: `Penjualan POS Maqshof #${posId.split('-')[0]}`,
         refId: posId, refType: 'pos_transaction', dibuatOleh: user.id,
         entries: [
            { kode: '2000', debet: total, kredit: 0 },   // Tabungan Berkurang
            { kode: '4000', debet: 0, kredit: total },   // Pendapatan Bertambah
            { kode: '5000', debet: hpp, kredit: 0 },     // Beban HPP
            { kode: '1100', debet: 0, kredit: hpp }      // Persediaan Barang Berkurang
         ]
       })
     } catch (e) { console.error("Jurnal error", e) }
  }

  revalidatePath(`/${orgSlug}/maqshof`)
  revalidatePath(`/${orgSlug}/maqshof/produk`)
  revalidatePath(`/${orgSlug}/maqshof/riwayat`)
  return { success: true, posId }
}
