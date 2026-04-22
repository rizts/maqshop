'use client'

// Component for editing product details

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { updateProduk } from '../../actions'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'

export default function EditProdukForm({ produk }: { produk: any }) {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const { organization } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isAktif, setIsAktif] = useState(produk.aktif)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.append('orgSlug', orgSlug)
    formData.append('produkId', produk.id)
    formData.append('aktif', String(isAktif))
    
    if (organization?.id) {
      formData.append('orgId', organization.id)
    }

    try {
      await updateProduk(formData)
      toast.success('Produk berhasil diperbarui')
      router.push(`/${orgSlug}/maqshof/produk`)
      router.refresh()
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
        <h1 className="text-3xl font-bold tracking-tight">Edit Produk</h1>
      </div>

      <Card>
        <form action={handleSubmit}>
          <CardHeader>
            <CardTitle>Rincian Barang Jualan</CardTitle>
            <CardDescription>Perbarui informasi produk jualan di maqshof.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Produk <span className="text-red-500">*</span></Label>
              <Input id="nama" name="nama" defaultValue={produk.nama} required placeholder="e.g. Nasi Goreng Kantin" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="harga_beli">Harga Modal/Beli (Rp)</Label>
                <Input id="harga_beli" name="harga_beli" type="number" min="0" defaultValue={produk.harga_beli} placeholder="0" />
                <p className="text-xs text-muted-foreground text-right w-full">Opsional, untuk report Laba</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="harga_jual">Harga Jual (Rp) <span className="text-red-500">*</span></Label>
                <Input id="harga_jual" name="harga_jual" type="number" min="0" defaultValue={produk.harga_jual} required placeholder="e.g. 5000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stok">Stok Saat Ini (Sistem)</Label>
                <Input id="stok" name="stok" type="number" min="0" defaultValue={produk.stok} />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch 
                  id="aktif" 
                  checked={isAktif}
                  onCheckedChange={setIsAktif}
                />
                <Label htmlFor="aktif">Status Aktif</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6 bg-slate-50/50">
            <Button variant="outline" type="button" asChild>
              <Link href={`/${orgSlug}/maqshof/produk`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
