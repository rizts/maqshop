'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UserPlus, Trash2, UserCog } from 'lucide-react'
import { linkGuardian, unlinkGuardian } from '../actions'
import { toast } from 'sonner'

interface Guardian {
  id: string
  relationship: string
  guardian: {
    id: string
    full_name: string
    phone: string | null
  }
}

interface Profile {
  id: string
  full_name: string
}

interface GuardianManagerProps {
  santriId: string
  orgId: string
  orgSlug: string
  currentGuardians: Guardian[]
  potentialGuardians: Profile[]
}

export default function GuardianManager({
  santriId,
  orgId,
  orgSlug,
  currentGuardians,
  potentialGuardians,
}: GuardianManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGuardian, setSelectedGuardian] = useState<string>('')
  const [relationship, setRelationship] = useState<string>('wali')

  const handleLink = async () => {
    if (!selectedGuardian) {
      toast.error('Pilih wali santri terlebih dahulu')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('santriId', santriId)
    formData.append('guardianId', selectedGuardian)
    formData.append('relationship', relationship)
    formData.append('orgSlug', orgSlug)
    formData.append('orgId', orgId)

    try {
      await linkGuardian(formData)
      toast.success('Wali santri berhasil dihubungkan')
      setIsOpen(false)
      setSelectedGuardian('')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghubungkan wali santri')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlink = async (linkId: string) => {
    if (!confirm('Apakah seius ingin memutuskan hubungan wali ini?')) return

    try {
      await unlinkGuardian(linkId, santriId, orgSlug)
      toast.success('Hubungan wali santri berhasil diputuskan')
    } catch (error: any) {
      toast.error(error.message || 'Gagal memutuskan hubungan')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Wali / Ortu Terhubung</p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Wali
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hubungkan Wali Santri</DialogTitle>
              <DialogDescription>
                Pilih pengguna dengan peran Wali Santri untuk dihubungkan dengan santri ini.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Pilih Wali Santri</Label>
                <Select value={selectedGuardian} onValueChange={setSelectedGuardian}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih akun wali..." />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialGuardians.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name}
                      </SelectItem>
                    ))}
                    {potentialGuardians.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Tidak ada akun wali tersedia
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hubungan / Relasi</Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hubungan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayah">Ayah</SelectItem>
                    <SelectItem value="ibu">Ibu</SelectItem>
                    <SelectItem value="wali">Wali</SelectItem>
                    <SelectItem value="paman">Paman</SelectItem>
                    <SelectItem value="bibi">Bibi</SelectItem>
                    <SelectItem value="kakek">Kakek</SelectItem>
                    <SelectItem value="nenek">Nenek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleLink} disabled={isLoading}>
                {isLoading ? 'Menghubungkan...' : 'Hubungkan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {currentGuardians.length > 0 ? (
        <ul className="space-y-2">
          {currentGuardians.map((g) => (
            <li key={g.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{g.guardian.full_name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {g.relationship || 'Wali'} • {g.guardian.phone || '-'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleUnlink(g.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center border-2 border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground italic">Belum ada wali terhubung</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsOpen(true)}>
             Klik untuk menghubungkan pertama kali
          </Button>
        </div>
      )}
    </div>
  )
}
