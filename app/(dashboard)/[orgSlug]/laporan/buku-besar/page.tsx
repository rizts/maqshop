import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format } from 'date-fns'

export default async function BukuBesarPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ start?: string; end?: string; coa?: string }>
}) {
  const { orgSlug } = await params
  const { start, end, coa } = await searchParams
  
  const supabase = await createClient()

  // Find org id
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any
  if (!org) return <div>Tenant Not Found</div>

  const date = new Date()
  const firstDay = start ? start : new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = end ? end : new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

  // Get all COA for filter dropdown
  const { data: coaList } = await (supabase
    .from('chart_of_accounts') as any)
    .select('*')
    .eq('org_id', org.id)
    .order('kode')

  // Query Entries
  let query = (supabase
    .from('jurnal_detail') as any)
    .select(`
      *,
      jurnal!inner(tanggal, keterangan, ref_id),
      coa:chart_of_accounts!inner(kode, nama)
    `)
    .eq('jurnal.org_id', org.id)
    .gte('jurnal.tanggal', firstDay)
    .lte('jurnal.tanggal', lastDay)
    .order('jurnal(tanggal)', { ascending: true })
    
  if (coa && coa !== 'all') {
    query = query.eq('coa_id', coa)
  }

  const { data: entries } = await query

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/${orgSlug}/laporan`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mutasi Buku Besar</h1>
            <p className="text-muted-foreground">General Ledger accounting per Chart of Account.</p>
          </div>
        </div>
        <div className="flex gap-2">
           <form className="flex items-center gap-2">
            <select name="coa" defaultValue={coa || 'all'} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm max-w-[200px] truncate">
               <option value="all">-- Semua Akun --</option>
               {coaList?.map((c: any) => (
                  <option key={c.id} value={c.id}>[{c.kode}] {c.nama}</option>
               ))}
            </select>
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
        <CardHeader>
          <CardTitle>Riwayat Mutasi Jurnal</CardTitle>
          <CardDescription>Menampilkan periode {firstDay} hingga {lastDay}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Tanggal</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground w-1/3">Keterangan</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Akun (COA)</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Debet</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {entries?.map((entry: any) => (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4">{format(new Date(entry.jurnal.tanggal), 'dd MMM yyyy')}</td>
                    <td className="p-4">{entry.jurnal.keterangan || '-'}</td>
                    <td className="p-4">
                      <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-xs mb-1">
                        [{entry.coa.kode}]
                      </span>
                      <br/>{entry.coa.nama}
                    </td>
                    <td className="p-4 text-right font-medium border-l">
                      {entry.debet > 0 ? formatCurrency(entry.debet) : '-'}
                    </td>
                    <td className="p-4 text-right font-medium border-l">
                      {entry.kredit > 0 ? formatCurrency(entry.kredit) : '-'}
                    </td>
                  </tr>
                ))}
                {(!entries || entries.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">Tidak ada jurnal dicatat pada periode ini.</td>
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
