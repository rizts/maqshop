'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Loader2 } from 'lucide-react'
import { resendInviteEmail } from './invite/actions'
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

interface ResendInviteButtonProps {
  userId: string
  userName: string
}

export function ResendInviteButton({ userId, userName }: ResendInviteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleResend = async () => {
    setIsPending(true)
    try {
      const res = await resendInviteEmail(userId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Email undangan berhasil dikirim ulang ke ${userName}`)
        setOpen(false)
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Terjadi kesalahan saat mengirim ulang undangan')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-primary h-8 w-8" title="Kirim Ulang Undangan">
          <Mail className="h-4 w-4" />
          <span className="sr-only">Kirim Ulang Undangan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kirim Ulang Undangan</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin mengirim ulang email aktivasi untuk <strong>{userName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Ulang'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
