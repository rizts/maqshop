'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createSantri } from './actions'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'

export default function TambahSantriPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const { organization, profile } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)

  // Determine allowed genders based on division
  let allowedGenders = [
    { value: 'male', label: 'Laki-laki (Banin)' },
    { value: 'female', label: 'Perempuan (Banat)' }
  ]
  
  if (profile?.division === 'banin') {
    allowedGenders = [{ value: 'male', label: 'Laki-laki (Banin)' }]
  } else if (profile?.division === 'banat') {
    allowedGenders = [{ value: 'female', label: 'Perempuan (Banat)' }]
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.append('orgSlug', orgSlug)
    if (organization?.id) {
      formData.append('orgId', organization.id)
    }

    try {
      await createSantri(formData)
      toast.success('Data santri berhasil ditambahkan')
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
      setIsLoading(false)
    }
  }

  if (!organization) return null

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgSlug}/santri`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Santri</h1>
      </div>

      <Card>
        <form action={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Pribadi Santri</CardTitle>
            <CardDescription>Masukkan informasi santri baru. Rekening tabungan akan otomatis dibuat dengan saldo 0.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nis">Nomor Induk Santri (NIS)</Label>
              <Input id="nis" name="nis" placeholder="e.g. 24001" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input id="full_name" name="full_name" required placeholder="Nama lengkap santri" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Divisi/Gender <span className="text-red-500">*</span></Label>
                <select 
                  id="gender" 
                  name="gender" 
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {allowedGenders.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun_masuk">Tahun Masuk</Label>
                <Input id="tahun_masuk" name="tahun_masuk" type="number" defaultValue={new Date().getFullYear()} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Input id="kelas" name="kelas" placeholder="e.g. 7A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kamar">Kamar / Asrama</Label>
                <Input id="kamar" name="kamar" placeholder="e.g. Abu Bakar 01" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/${orgSlug}/santri`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Data'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
