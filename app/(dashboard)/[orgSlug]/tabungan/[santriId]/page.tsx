import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format } from 'date-fns'

export default async function DetailTabunganSantriPage({
  params,
}: {
  params: Promise<{ orgSlug: string; santriId: string }>
}) {
  const { orgSlug, santriId } = await params
  const supabase = await createClient()

  // Find org id
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any
  if (!org) notFound()

  // Fetch Santri and Tabungan
  const { data: santri } = await (supabase
    .from('santri') as any)
    .select('*, tabungan(*)')
    .eq('id', santriId)
    .single()

  if (!santri || !santri.tabungan) notFound()

  // Fetch Transaction History
  const { data: riwayat } = await (supabase
    .from('transaksi_tabungan') as any)
    .select('*, profil:profiles!dibuat_oleh(full_name)')
    .eq('santri_id', santriId)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/${orgSlug}/tabungan`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buku Tabungan</h1>
            <p className="text-muted-foreground">{santri.full_name} ({santri.nis || '-'})</p>
          </div>
        </div>
        <Button variant="outline">
           <Download className="mr-2 h-4 w-4" /> Export Lengkap
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="col-span-2 md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(santri.tabungan.saldo)}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-green-500" /> Total Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-green-600">{formatCurrency(santri.tabungan.total_deposit)}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-500" /> Total Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-red-600">{formatCurrency(santri.tabungan.total_keluar)}</div>
          </CardContent>
        </Card>
        <div className="col-span-2 md:col-span-1 flex flex-col gap-2 justify-center">
            <Button className="w-full" asChild>
              <Link href={`/${orgSlug}/tabungan/deposit?santri_id=${santri.id}`}>+ Deposit</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/${orgSlug}/tabungan/tarik?santri_id=${santri.id}`}>- Penarikan</Link>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mutasi Rekening</CardTitle>
          <CardDescription>Seluruh riwayat transaksi tabungan santri.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Tanggal & Waktu</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Tipe</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Oleh</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Keterangan</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Debit (Masuk)</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Kredit (Keluar)</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody>
                {riwayat?.map((trx: any) => {
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
                      <td className="p-4">{trx.profil?.full_name || 'System'}</td>
                      <td className="p-4">{trx.keterangan || '-'}</td>
                      <td className={`p-4 text-right font-medium border-l ${isMasuk ? 'text-green-600' : ''}`}>
                        {isMasuk ? formatCurrency(trx.jumlah) : '-'}
                      </td>
                      <td className={`p-4 text-right font-medium border-l ${!isMasuk ? 'text-red-600' : ''}`}>
                        {!isMasuk ? formatCurrency(trx.jumlah) : '-'}
                      </td>
                      <td className="p-4 text-right font-bold border-l bg-slate-50/50">
                        {formatCurrency(trx.saldo_sesudah)}
                      </td>
                    </tr>
                  )
                })}
                {(!riwayat || riwayat.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada mutasi ditemukan.</td>
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
