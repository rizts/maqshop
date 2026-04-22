'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { submitTopupRequest } from './actions'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud } from 'lucide-react'

export default function OrtuTopupPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const [children, setChildren] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { organization, profile } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    async function fetchChildren() {
      if (profile?.id && organization?.id) {
        setIsLoadingData(true)
        try {
          const { data, error } = await supabase
            .from('guardian_santri')
            .select('santri(id, full_name, nis)')
            .eq('guardian_id', profile.id)
            .eq('org_id', organization.id)

          if (error) throw error

          if (data) {
            setChildren(data.map((d: any) => d.santri).filter(Boolean))
          }
        } catch (error) {
          console.error('Error fetching children:', error)
          toast.error('Gagal mengambil data santri')
        } finally {
          setIsLoadingData(false)
        }
      }
    }
    
    fetchChildren()
  }, [profile, organization, supabase])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.append('orgSlug', orgSlug)

    try {
      await submitTopupRequest(formData)
      toast.success('Pengajuan top-up berhasil dikirim. Menunggu persetujuan admin.')
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-8">
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl font-bold tracking-tight">Top-up Saldo Santri</h1>
         <p className="text-muted-foreground">Silakan transfer ke rekening pondok dan unggah bukti pembayarannya.</p>
      </div>

      <Card>
        <form action={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Konfirmasi Transfer</CardTitle>
            <CardDescription>Pilih anak Anda dan lampirkan bukti struk transfer atau screenshot mobile banking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="santriId">Pilih Anak <span className="text-red-500">*</span></Label>
              <select 
                id="santriId" 
                name="santriId" 
                required
                defaultValue=""
                disabled={isLoadingData || children.length === 0}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingData ? (
                  <option value="" disabled>Memuat data santri...</option>
                ) : children.length === 0 ? (
                  <option value="" disabled>Belum ada santri terhubung</option>
                ) : (
                  <>
                    <option value="" disabled>-- Pilih Santri --</option>
                    {children.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name} {s.nis ? `(${s.nis})` : ''}</option>
                    ))}
                  </>
                )}
              </select>
              {!isLoadingData && children.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Data anak belum terhubung. Silakan hubungi admin pondok.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlah">Nominal Transfer (Rp) <span className="text-red-500">*</span></Label>
              <Input 
                id="jumlah" 
                name="jumlah" 
                type="number" 
                min="10000" 
                required 
                placeholder="e.g. 500000" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bukti">Upload Bukti Transfer <span className="text-red-500">*</span></Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                    <label
                      htmlFor="bukti"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none hover:text-primary/80"
                    >
                      <span>Upload a file</span>
                      <Input id="bukti" name="bukti" type="file" className="sr-only" required accept="image/jpeg,image/png,image/jpg,application/pdf" />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, PDF up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
               <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
               <Input 
                 id="catatan" 
                 name="catatan" 
                 placeholder="e.g. Dari ayah, tolong dikonfirmasi" 
               />
             </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/${orgSlug}/ortu/dashboard`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
               {isLoading ? 'Mengirim...' : 'Kirim Konfirmasi'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="rounded-xl border bg-slate-100 p-6">
         <h3 className="font-semibold mb-2">Informasi Pembayaran Pondok:</h3>
         <p className="text-sm text-slate-700">Bank Syariah Indonesia (BSI)<br/>No. Rek: <strong>7123456789</strong><br/>a.n. Yayasan Deposantri</p>
      </div>
    </div>
  )
}
