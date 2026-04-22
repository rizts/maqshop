import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { processDeposit } from '../actions'

export default async function DepositPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ santri_id?: string }>
}) {
  const { orgSlug } = await params
  const { santri_id } = await searchParams
  
  const supabase = await createClient()

  // Get Org ID
  const { data: org } = await (supabase.from('organizations') as any).select('id').eq('slug', orgSlug).single()
  
  // Fetch active santri list for selection
  const { data: santriList } = await (supabase
    .from('santri') as any)
    .select('id, full_name, nis')
    .eq('org_id', org?.id)
    .eq('status', 'active')
    .order('full_name')

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgSlug}/tabungan`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Deposit Langsung</h1>
      </div>

      <Card>
        <form action={processDeposit}>
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="orgId" value={org?.id} />
          
          <CardHeader>
            <CardTitle>Form Penerimaan Setoran (Tunai)</CardTitle>
            <CardDescription>Catat setoran tabungan santri yang diterima secara langsung oleh admin/staff maqshof.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="santriId">Pilih Santri <span className="text-red-500">*</span></Label>
              <select 
                id="santriId" 
                name="santriId" 
                required
                defaultValue={santri_id || ""}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>-- Pilih data santri --</option>
                {santriList?.map((s: any) => (
                   <option key={s.id} value={s.id}>{s.nis ? `[${s.nis}] ` : ''}{s.full_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah Setoran (Rp) <span className="text-red-500">*</span></Label>
              <Input 
                id="jumlah" 
                name="jumlah" 
                type="number" 
                min="1000" 
                step="100" 
                required 
                placeholder="e.g. 50000" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan Tambahan (Opsional)</Label>
              <Input 
                id="keterangan" 
                name="keterangan" 
                placeholder="e.g. Dititipkan lewat ortu saat kunjungan" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/${orgSlug}/tabungan`}>Batal</Link>
            </Button>
            <Button type="submit">Proses Deposit</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
