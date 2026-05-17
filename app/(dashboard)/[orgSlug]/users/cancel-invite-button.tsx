'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteInvitedUser } from './invite/actions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface CancelInviteButtonProps {
  userId: string
  userName: string
  orgSlug: string
  isInvited?: boolean
}

export function CancelInviteButton({ userId, userName, orgSlug, isInvited = true }: CancelInviteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleCancelInvite = async () => {
    setIsPending(true)
    try {
      const res = await deleteInvitedUser(userId, orgSlug)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(
          isInvited
            ? `Undangan untuk ${userName} berhasil dibatalkan`
            : `Pengguna ${userName} berhasil dihapus`
        )
        setOpen(false)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(
        isInvited
          ? 'Terjadi kesalahan saat membatalkan undangan'
          : 'Terjadi kesalahan saat menghapus pengguna'
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">
            {isInvited ? 'Batalkan Undangan' : 'Hapus Pengguna'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isInvited ? 'Batalkan Undangan' : 'Hapus Pengguna'}
          </DialogTitle>
          <DialogDescription>
            {isInvited ? (
              <>
                Apakah Anda yakin ingin membatalkan undangan untuk <strong>{userName}</strong>? Tindakan ini akan menghapus akun undangan dan tidak dapat dibatalkan.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menghapus pengguna <strong>{userName}</strong> secara permanen? Akun ini akan dihapus dari sistem autentikasi dan database.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Kembali
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancelInvite}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isInvited ? 'Membatalkan...' : 'Menghapus...'}
              </>
            ) : (
              isInvited ? 'Batalkan Undangan' : 'Hapus Pengguna'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
