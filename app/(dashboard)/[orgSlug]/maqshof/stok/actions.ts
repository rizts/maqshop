'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { StokLogType } from '@/types/base'

export async function adjustStock(formData: FormData) {
  const orgSlug = formData.get('orgSlug') as string
  const orgId = formData.get('orgId') as string
  const produkId = formData.get('produkId') as string
  const tipe = formData.get('tipe') as StokLogType
  const qty = Number(formData.get('qty'))
  const keterangan = formData.get('keterangan') as string

  if (!produkId || qty === 0 || !tipe) throw new Error('Input tidak valid')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: produk } = await (supabase.from('produk') as any).select('stok').eq('id', produkId).single()
  if (!produk) throw new Error('Produk tidak ditemukan')

  const stokSebelum = produk.stok || 0
  let stokSesudah = stokSebelum

  if (tipe === 'masuk') {
    stokSesudah = stokSebelum + qty
  } else if (tipe === 'keluar') {
    stokSesudah = stokSebelum - qty
  } else if (tipe === 'koreksi') {
    stokSesudah = qty // For correction, qty is the NEW total stock
  }

  const { error: updError } = await (supabase
    .from('produk') as any)
    .update({ stok: stokSesudah })
    .eq('id', produkId)

  if (updError) throw new Error('Gagal update stok produk')

  // Log the mutation
  const { error: logError } = await (supabase.from('stok_log') as any).insert({
    org_id: orgId,
    produk_id: produkId,
    tipe: tipe,
    qty: tipe === 'koreksi' ? (stokSesudah - stokSebelum) : qty,
    stok_sebelum: stokSebelum,
    stok_sesudah: stokSesudah,
    keterangan: keterangan || (tipe === 'koreksi' ? 'Koreksi stok manual' : 'Penyesuaian stok'),
    dibuat_oleh: user?.id
  })

  if (logError) console.error("Failed to log stock mutation:", logError)

  revalidatePath(`/${orgSlug}/maqshof/stok`)
  revalidatePath(`/${orgSlug}/maqshof/produk`)
}
