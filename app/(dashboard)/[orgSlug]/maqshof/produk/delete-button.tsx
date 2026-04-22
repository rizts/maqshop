'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteProduk } from './actions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function DeleteProductButton({ 
  produkId, 
  produkNama, 
  orgSlug 
}: { 
  produkId: string, 
  produkNama: string, 
  orgSlug: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProduk(produkId, orgSlug)
      toast.success('Produk berhasil dihapus')
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus produk')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk <strong>{produkNama}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
