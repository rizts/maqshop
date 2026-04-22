'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusCircle } from 'lucide-react'
import { adjustStock } from './actions'
import { toast } from 'sonner'

export function StokMutationForm({ 
  products, 
  orgId, 
  orgSlug 
}: { 
  products: any[], 
  orgId: string, 
  orgSlug: string 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('orgId', orgId)
    formData.append('orgSlug', orgSlug)

    try {
      await adjustStock(formData)
      toast.success('Mutasi stok berhasil dicatat')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mencatat mutasi stok')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Mutasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Catat Mutasi Stok</DialogTitle>
            <DialogDescription>
              Gunakan form ini untuk menambah stok masukan, pengeluaran, atau koreksi barang.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="produkId">Pilih Produk</Label>
              <Select name="produkId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama} (Stok: {p.stok} {p.satuan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tipe">Tipe Mutasi</Label>
                <Select name="tipe" defaultValue="masuk" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Stok Masuk</SelectItem>
                    <SelectItem value="keluar">Stok Keluar</SelectItem>
                    <SelectItem value="koreksi">Koreksi (Reset)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qty">Jumlah / Total</Label>
                <Input id="qty" name="qty" type="number" min="0" required placeholder="0" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
              <Input id="keterangan" name="keterangan" placeholder="Contoh: Barang datang dari vendor X" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Mutasi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
