import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, ShoppingBag, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'
import { Input } from '@/components/ui/input'

export default async function LaporanTabunganPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ from?: string, to?: string }>
}) {
  const { orgSlug } = await params
  const { from, to } = await searchParams
  
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any

  // Default date range: current month
  const startDate = from ? startOfDay(new Date(from)).toISOString() : startOfMonth(new Date()).toISOString()
  const endDate = to ? endOfDay(new Date(to)).toISOString() : endOfMonth(new Date()).toISOString()

  // 1. Fetch Aggregated Stats for the period
  const { data: statsRaw } = await (supabase
    .from('transaksi_tabungan') as any)
    .select('tipe, jumlah')
    .eq('org_id', org?.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const totalDeposit = statsRaw?.filter((t: any) => t.tipe.startsWith('deposit')).reduce((acc: number, curr: any) => acc + Number(curr.jumlah), 0) || 0
  const totalTarik = statsRaw?.filter((t: any) => t.tipe === 'withdrawal').reduce((acc: number, curr: any) => acc + Number(curr.jumlah), 0) || 0
  const totalBelanja = statsRaw?.filter((t: any) => t.tipe === 'pos_deduct').reduce((acc: number, curr: any) => acc + Number(curr.jumlah), 0) || 0

  // 2. Fetch Total Saldo (Realtime current)
  const { data: totalSaldoData } = await (supabase
    .from('tabungan') as any)
    .select('saldo')
    .eq('org_id', org?.id)
  
  const currentTotalSaldo = totalSaldoData?.reduce((acc: number, curr: any) => acc + Number(curr.saldo), 0) || 0

  // 3. Fetch Transaction Detailed Log
  const { data: transactions } = await (supabase
    .from('transaksi_tabungan') as any)
    .select(`
      *,
      santri (full_name, nis),
      pembuat:profiles!dibuat_oleh (full_name)
    `)
    .eq('org_id', org?.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/${orgSlug}/laporan`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rekap Tabungan Global</h1>
            <p className="text-muted-foreground">Laporan perputaran dana tabungan santri secara kolektif.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary/70">Total Saldo Saat Ini</CardDescription>
            <CardTitle className="text-2xl font-bold">{formatCurrency(currentTotalSaldo)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground italic">*Akumulasi dana mengendap hari ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription>Total Deposit</CardDescription>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{formatCurrency(totalDeposit)}</div>
            <p className="text-xs text-muted-foreground">Selama periode dipilih</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription>Total Penarikan</CardDescription>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{formatCurrency(totalTarik)}</div>
            <p className="text-xs text-muted-foreground">Cash Out (Tunai)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription>Total Belanja</CardDescription>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">-{formatCurrency(totalBelanja)}</div>
            <p className="text-xs text-muted-foreground">Via Maqshof (POS)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Riwayat Transaksi Global</CardTitle>
              <CardDescription>Menampilkan 200 aktivitas keuangan terakhir dalam rentang waktu.</CardDescription>
            </div>
            <form className="flex items-center gap-2">
              <div className="grid gap-1">
                 <Label className="text-[10px] uppercase text-muted-foreground ml-1">Dari</Label>
                 <Input type="date" name="from" defaultValue={from || format(new Date(startDate), 'yyyy-MM-dd')} className="h-9" />
              </div>
              <div className="grid gap-1">
                 <Label className="text-[10px] uppercase text-muted-foreground ml-1">Sampai</Label>
                 <Input type="date" name="to" defaultValue={to || format(new Date(endDate), 'yyyy-MM-dd')} className="h-9" />
              </div>
              <Button type="submit" size="icon" className="mt-5">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
           <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Waktu</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Santri</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Jenis Transaksi</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Jumlah</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Saldo Akhir</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground border-l">Keterangan</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Oleh</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((t: any) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 whitespace-nowrap">{format(new Date(t.created_at), 'dd/MM/yy HH:mm')}</td>
                    <td className="p-4">
                       <p className="font-medium">{t.santri?.full_name}</p>
                       <p className="text-[10px] text-muted-foreground">{t.santri?.nis}</p>
                    </td>
                    <td className="p-4 uppercase text-[10px] font-bold tracking-tight">
                       {t.tipe === 'deposit_cash' && <span className="text-green-600">Deposit Tunai</span>}
                       {t.tipe === 'deposit_transfer' && <span className="text-green-600">Deposit Transfer</span>}
                       {t.tipe === 'withdrawal' && <span className="text-red-600">Penarikan Tunai</span>}
                       {t.tipe === 'pos_deduct' && <span className="text-orange-600">Belanja Kantin</span>}
                       {t.tipe === 'adjustment' && <span className="text-blue-600">Penyesuaian</span>}
                    </td>
                    <td className={`p-4 text-right font-bold ${['withdrawal', 'pos_deduct'].includes(t.tipe) ? 'text-red-600' : 'text-green-600'}`}>
                       {['withdrawal', 'pos_deduct'].includes(t.tipe) ? '-' : '+'}{formatCurrency(t.jumlah)}
                    </td>
                    <td className="p-4 text-right border-l font-medium">{formatCurrency(t.saldo_sesudah)}</td>
                    <td className="p-4 border-l max-w-[200px] truncate italic text-muted-foreground">{t.keterangan || '-'}</td>
                    <td className="p-4 text-muted-foreground">{t.pembuat?.full_name || 'System'}</td>
                  </tr>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada mutasi ditemukan dalam rentang tanggal ini.</td>
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

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}
