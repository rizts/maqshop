import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

export default async function LabaRugiPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ start?: string; end?: string }>
}) {
  const { orgSlug } = await params
  const { start, end } = await searchParams
  
  const supabase = await createClient()

  // Find org id
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any
  if (!org) return <div>Tenant Not Found</div>

  // Set default period to current month if not provided
  const date = new Date()
  const firstDay = start ? start : new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = end ? end : new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

  // For P&L we query the Jurnal table where COA codes are 4000 (Pendapatan) and 5000 (Beban)
  const query = (supabase
    .from('jurnal_entries') as any)
    .select(`
      *,
      jurnal!inner(tanggal),
      coa:chart_of_accounts!inner(kode, nama, tipe)
    `)
    .eq('jurnal.org_id', org.id)
    .in('coa.tipe', ['revenue', 'cogs', 'expense'])
    .gte('jurnal.tanggal', firstDay)
    .lte('jurnal.tanggal', lastDay)

  const { data: entries } = await query

  let totalPendapatan = 0
  let totalBeban = 0

  const pendapatanByCoa: Record<string, { nama: string; total: number }> = {}
  const bebanByCoa: Record<string, { nama: string; total: number }> = {}

  // Calculate
  entries?.forEach((entry: any) => {
    // Determine net value based on normal balance
    // revenue normal balance is Kredit
    if ((entry.coa as any).tipe === 'revenue') {
      const net = Number(entry.kredit) - Number(entry.debet)
      totalPendapatan += net
      
      const coaKey = (entry.coa as any).kode
      if (!pendapatanByCoa[coaKey]) pendapatanByCoa[coaKey] = { nama: (entry.coa as any).nama, total: 0 }
      pendapatanByCoa[coaKey].total += net
    } 
    // cogs and expense normal balance is Debet
    else if (['cogs', 'expense'].includes((entry.coa as any).tipe)) {
      const net = Number(entry.debet) - Number(entry.kredit)
      totalBeban += net
      
      const coaKey = (entry.coa as any).kode
      if (!bebanByCoa[coaKey]) bebanByCoa[coaKey] = { nama: (entry.coa as any).nama, total: 0 }
      bebanByCoa[coaKey].total += net
    }
  })

  const labaBersih = totalPendapatan - totalBeban

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/${orgSlug}/laporan`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laba Rugi (Profit & Loss)</h1>
            <p className="text-muted-foreground">Laporan kinerja finansial institusi.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <form className="flex items-center gap-2">
            <input type="date" name="start" defaultValue={firstDay} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <span>-</span>
            <input type="date" name="end" defaultValue={lastDay} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <Button type="submit" variant="secondary">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </form>
          <Button variant="outline">
             <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-2xl uppercase tracking-widest">{org.name || 'DEPOSANTRI'}</CardTitle>
          <CardDescription className="text-lg font-semibold mt-1">LAPORAN LABA RUGI</CardDescription>
          <p className="text-sm text-muted-foreground mt-1">Periode: {firstDay} s/d {lastDay}</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full text-sm">
            
            {/* PENDAPATAN */}
            <div className="bg-muted/50 p-4 font-bold text-base flex justify-between">
               <span>PENDAPATAN / PENJUALAN</span>
            </div>
            {Object.keys(pendapatanByCoa).length === 0 ? (
               <div className="p-4 text-muted-foreground italic">Tidak ada transaksi tercatat.</div>
            ) : (
               Object.keys(pendapatanByCoa).map(k => (
                  <div key={k} className="p-4 flex justify-between border-b last:border-0 hover:bg-slate-50">
                    <span className="pl-4">{pendapatanByCoa[k].nama} ({k})</span>
                    <span>{formatCurrency(pendapatanByCoa[k].total)}</span>
                  </div>
               ))
            )}
            <div className="p-4 flex justify-between font-bold border-b-4 border-slate-300">
               <span>Total Pendapatan</span>
               <span>{formatCurrency(totalPendapatan)}</span>
            </div>

            {/* BEBAN / HPP */}
            <div className="bg-muted/50 p-4 font-bold text-base flex justify-between mt-4">
               <span>BEBAN / HPP</span>
            </div>
            {Object.keys(bebanByCoa).length === 0 ? (
               <div className="p-4 text-muted-foreground italic">Tidak ada transaksi tercatat.</div>
            ) : (
               Object.keys(bebanByCoa).map(k => (
                  <div key={k} className="p-4 flex justify-between border-b last:border-0 hover:bg-slate-50">
                    <span className="pl-4">{bebanByCoa[k].nama} ({k})</span>
                    <span>{formatCurrency(bebanByCoa[k].total)}</span>
                  </div>
               ))
            )}
            <div className="p-4 flex justify-between font-bold border-b-4 border-slate-300">
               <span>Total Beban Operasional</span>
               <span>({formatCurrency(totalBeban)})</span>
            </div>

            {/* LABA BERSIH */}
            <div className={`p-6 mt-4 flex justify-between font-bold text-xl rounded-b-lg ${labaBersih >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
               <span>LABA (RUGI) BERSIH</span>
               <span>{formatCurrency(labaBersih)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
