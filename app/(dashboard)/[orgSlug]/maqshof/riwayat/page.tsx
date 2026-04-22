import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ReceiptText, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format } from 'date-fns'

export default async function PosRiwayatPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any

  // Fetch POS Transactions
  const { data: riwayat } = await (supabase
    .from('pos_transaksi') as any)
    .select(`
      *,
      santri (full_name, nis),
      kasir:profiles!kasir_id (full_name)
    `)
    .eq('org_id', org?.id)
    .order('created_at', { ascending: false })
    .limit(100) // latest 100

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/${orgSlug}/maqshof`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi POS</h1>
            <p className="text-muted-foreground">Catatan seluruh struk dan aktivitas belanja maqshof.</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Mutasi Kasir 100 Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground">No. Struk</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Waktu</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Kasir</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Pembeli (Santri)</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Total Belanja</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-center">Status</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {riwayat?.map((trx: any) => (
                  <tr key={trx.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-medium text-muted-foreground">{trx.id.split('-')[0].toUpperCase()}</td>
                    <td className="p-4">{format(new Date(trx.created_at), 'dd MMM yy, HH:mm')}</td>
                    <td className="p-4">{trx.kasir?.full_name || 'Admin'}</td>
                    <td className="p-4 font-medium">{trx.santri?.full_name || 'Guest'}</td>
                    <td className="p-4 text-right font-bold text-primary border-l">
                      {formatCurrency(trx.total)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-green-100 text-green-700">
                        {trx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="text-primary">
                        <ReceiptText className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!riwayat || riwayat.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada transaksi ditemukan.</td>
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
