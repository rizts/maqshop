'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduk(formData: FormData) {
  const orgSlug = formData.get('orgSlug') as string
  const orgId = formData.get('orgId') as string
  const nama = formData.get('nama') as string
  const harga_jual = Number(formData.get('harga_jual'))
  const harga_beli = Number(formData.get('harga_beli')) || 0
  const stok = Number(formData.get('stok')) || 0

  const supabase = await createClient()

  const { error } = await supabase
    .from('produk')
    .insert({
      org_id: orgId,
      nama,
      harga_jual,
      harga_beli,
      stok,
      aktif: true
    })

  if (error) throw new Error('Gagal menambah produk: ' + error.message)

  revalidatePath(`/${orgSlug}/maqshof/produk`)
}

export async function updateStok(formData: FormData) {
  const orgSlug = formData.get('orgSlug') as string
  const orgId = formData.get('orgId') as string
  const produkId = formData.get('produkId') as string
  const addedStok = Number(formData.get('tambah_stok'))

  if (!produkId || addedStok <= 0) throw new Error('Input tidak valid')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: produk } = await supabase.from('produk').select('stok').eq('id', produkId).single()
  if (!produk) throw new Error('Produk tidak ditemukan')

  const stokSebelum = produk.stok || 0
  const stokSesudah = stokSebelum + addedStok

  const { error: updError } = await supabase
    .from('produk')
    .update({ stok: stokSesudah })
    .eq('id', produkId)

  if (updError) throw new Error('Gagal update stok produk')

  // Log
  await supabase.from('stok_log').insert({
    org_id: orgId,
    produk_id: produkId,
    tipe: 'masuk',
    qty: addedStok,
    stok_sebelum: stokSebelum,
    stok_sesudah: stokSesudah,
    keterangan: 'Penambahan stok manual',
    dibuat_oleh: user?.id
  })

  revalidatePath(`/${orgSlug}/maqshof/produk`)
}
