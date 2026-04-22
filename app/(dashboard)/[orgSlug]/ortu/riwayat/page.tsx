import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format } from 'date-fns'

export default async function OrtuRiwayatPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ santri_id?: string }>
}) {
  const { orgSlug } = await params
  const { santri_id } = await searchParams
  
  const supabase = await createClient()

  // Find org id
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any

  // Get user profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  // Verify access and get children
  const { data: childrenData } = await supabase
    .from('guardian_santri')
    .select('santri_id')
    .eq('guardian_id', user.id) as any

  const allowedSantriIds = childrenData?.map((r: any) => r.santri_id) || []
  
  // Choose santri to display
  // If query param exists and is allowed, use it. Otherwise use the first allowed child.
  const selectedSantriId = (santri_id && allowedSantriIds.includes(santri_id)) 
    ? santri_id 
    : (allowedSantriIds.length > 0 ? allowedSantriIds[0] : null)

  const { data: santriInfo } = selectedSantriId 
    ? await supabase.from('santri').select('full_name').eq('id', selectedSantriId).single() as any
    : { data: null }

  // Fetch Mutasi
  const { data: mutasi } = selectedSantriId 
    ? await supabase
        .from('transaksi_tabungan')
        .select('*')
        .eq('santri_id', selectedSantriId)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgSlug}/ortu/dashboard`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riwayat Mutasi & Jajan</h1>
          <p className="text-muted-foreground">{santriInfo ? `Ananda: ${santriInfo.full_name}` : 'Silakan hubungi admin pondok.'}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>100 Transaksi Terakhir</CardTitle>
          <CardDescription>Catatan pengambilan dana, jajan kantin, dan transfer masuk.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Waktu Trx</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Tipe</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Keterangan</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Debit (Uang Masuk)</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Kredit (Belanja/Tarik)</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Sisa Saldo</th>
                </tr>
              </thead>
              <tbody>
                {mutasi?.map((trx: any) => {
                  const isMasuk = trx.tipe.includes('deposit') || trx.tipe === 'adjustment' && trx.saldo_sesudah > trx.saldo_sebelum;
                  return (
                    <tr key={trx.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">{format(new Date(trx.created_at), 'dd MMM yyyy, HH:mm')}</td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider
                          ${isMasuk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {trx.tipe.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">{trx.keterangan || '-'}</td>
                      <td className="p-4 text-right font-medium text-green-600">
                        {isMasuk ? `+${formatCurrency(trx.jumlah)}` : ''}
                      </td>
                      <td className="p-4 text-right font-medium border-l text-red-600">
                        {!isMasuk ? `-${formatCurrency(trx.jumlah)}` : ''}
                      </td>
                      <td className="p-4 text-right font-bold border-l bg-slate-50/50">
                        {formatCurrency(trx.saldo_sesudah)}
                      </td>
                    </tr>
                  )
                })}
                {(!mutasi || mutasi.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Belum ada transaksi sama sekali.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
