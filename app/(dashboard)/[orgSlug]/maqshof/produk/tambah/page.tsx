'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createProduk } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'

export default function TambahProdukPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const { organization } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.append('orgSlug', orgSlug)
    if (organization?.id) {
      formData.append('orgId', organization.id)
    }

    try {
      await createProduk(formData)
      toast.success('Produk berhasil ditambahkan')
      // Let server action redirect/revalidate or stay on form
      // for rapid adding, we can clear the form
      const form = document.getElementById('produkForm') as HTMLFormElement
      if(form) form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgSlug}/maqshof/produk`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Produk Baru</h1>
      </div>

      <Card>
        <form id="produkForm" action={handleSubmit}>
          <CardHeader>
            <CardTitle>Rincian Barang Jualan</CardTitle>
            <CardDescription>Masukkan nama, harga, dan stok awal barang yang akan dijual di maqshof.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Produk <span className="text-red-500">*</span></Label>
              <Input id="nama" name="nama" required placeholder="e.g. Nasi Goreng Kantin" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="harga_beli">Harga Modal/Beli (Rp)</Label>
                <Input id="harga_beli" name="harga_beli" type="number" min="0" placeholder="0" />
                <p className="text-xs text-muted-foreground text-right w-full">Opsional, untuk report Laba</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="harga_jual">Harga Jual (Rp) <span className="text-red-500">*</span></Label>
                <Input id="harga_jual" name="harga_jual" type="number" min="0" required placeholder="e.g. 5000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stok">Stok Awal</Label>
              <Input id="stok" name="stok" type="number" min="0" defaultValue="0" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/${orgSlug}/maqshof/produk`}>Kembali Ke Daftar</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan & Tambah Lagi'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
