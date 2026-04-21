'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { processPenarikan } from './actions'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function WithdrawalPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orgSlug = params.orgSlug as string
  const santriIdQuery = searchParams.get('santri_id')
  const { organization } = useAuthStore()
  
  const [santriList, setSantriList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (organization?.id) {
       supabase.from('santri')
        .select('id, full_name, nis, tabungan(saldo)')
        .eq('org_id', organization.id)
        .eq('status', 'active')
        .order('full_name')
        .then(({ data }) => {
           if(data) setSantriList(data)
        })
    }
  }, [organization, supabase])

  const [selectedSantriId, setSelectedSantriId] = useState(santriIdQuery || "")
  const selectedSantri = santriList.find(s => s.id === selectedSantriId)
  
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.append('orgSlug', orgSlug)
    if (organization?.id) {
      formData.append('orgId', organization.id)
    }

    try {
      await processPenarikan(formData)
      toast.success('Penarikan dana berhasil diproses')
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgSlug}/tabungan`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Penarikan Dana</h1>
      </div>

      <Card>
        <form action={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Penarikan Tunai Di Luar Maqshof</CardTitle>
            <CardDescription>Catat penarikan dana untuk keperluan sekolah, uang saku jalan-jalan, dll. Keterangan wajib diisi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="santriId">Pilih Santri <span className="text-red-500">*</span></Label>
              <select 
                id="santriId" 
                name="santriId" 
                required
                value={selectedSantriId}
                onChange={(e) => setSelectedSantriId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>-- Pilih data santri --</option>
                {santriList?.map(s => (
                   <option key={s.id} value={s.id}>{s.nis ? `[${s.nis}] ` : ''}{s.full_name}</option>
                ))}
              </select>
            </div>

            {selectedSantri && (
              <div className="rounded-md bg-muted p-4 text-sm">
                Saldo saat ini: <span className="font-bold text-lg">Rp {new Intl.NumberFormat('id-ID').format(selectedSantri.tabungan?.saldo || 0)}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah Penarikan (Rp) <span className="text-red-500">*</span></Label>
              <Input 
                id="jumlah" 
                name="jumlah" 
                type="number" 
                min="1000" 
                step="500" 
                required 
                placeholder="e.g. 150000" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan / Keperluan <span className="text-red-500">*</span></Label>
              <Input 
                id="keterangan" 
                name="keterangan"
                required 
                placeholder="e.g. Bayar buku LKS pelajaran Fiqih" 
              />
              <p className="text-xs text-muted-foreground">Keterangan sifatnya mandatory (wajib diisi).</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/${orgSlug}/tabungan`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
               {isLoading ? 'Memproses...' : 'Proses Tarik Dana'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
