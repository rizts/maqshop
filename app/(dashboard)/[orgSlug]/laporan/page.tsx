import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, BookOpen, TrendingUp, DownloadCloud } from 'lucide-react'

export default async function LaporanDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pusat Laporan</h1>
          <p className="text-muted-foreground">Report akuntansi dan mutasi keuangan organisasi.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" asChild>
          <Link href={`/${orgSlug}/laporan/laba-rugi`}>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Laba Rugi (P&L)</CardTitle>
              <CardDescription>Laporan untung rugi penjualan maqshof berdasarkan periode waktu dan divisi tertentu.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" asChild>
          <Link href={`/${orgSlug}/laporan/buku-besar`}>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Buku Besar Akuntansi</CardTitle>
              <CardDescription>Mutasi jurnal double-entry otomatis untuk setiap Chart of Account (COA).</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        {/* Placeholder for future reporting such as Santri balances recap */}
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" asChild>
          <Link href={`/${orgSlug}/laporan/tabungan`}>
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Rekap Tabungan Global</CardTitle>
              <CardDescription>Monitoring seluruh saldo santri dan riwayat mutasi dana deposit/penarikan.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
