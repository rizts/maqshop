import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, ArrowLeftRight, Clock } from 'lucide-react'

export default async function MaqshofDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Find org id
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any
  
  // Basic stats
  const today = new Date().toISOString().split('T')[0]
  
  // Products count
  const { count: productCount } = await supabase
    .from('produk')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org?.id) as any

  const { count: txCount } = await supabase
    .from('pos_transaksi')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org?.id)
    .gte('created_at', today) as any

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sales (Maqshof)</h1>
          <p className="text-muted-foreground">Pusat transaksi kantin dan koperasi santri.</p>
        </div>
        <Button size="lg" className="h-12 text-lg px-8" asChild>
          <Link href={`/${orgSlug}/maqshof/kasir`}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buka Kasir
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{txCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total struk transaksi berhasil diverifikasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount || 0}</div>
            <p className="text-xs text-muted-foreground">Item tercatat dalam sistem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Peringatan Stok</CardTitle>
             <ArrowLeftRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">0</div>
            <p className="text-xs text-muted-foreground">Produk hampir habis (&lt; 5 pcs)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" asChild>
          <Link href={`/${orgSlug}/maqshof/produk`}>
            <CardHeader>
              <Package className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Master Produk</CardTitle>
              <CardDescription>Tambah, edit, dan atur harga jual/beli produk santri.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" asChild>
          <Link href={`/${orgSlug}/maqshof/riwayat`}>
            <CardHeader>
              <Clock className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>Lihat seluruh mutasi kasir dan cetak ulang struk.</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" asChild>
          <Link href={`/${orgSlug}/maqshof/stok`}>
            <CardHeader>
              <ArrowLeftRight className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Mutasi Stok</CardTitle>
              <CardDescription>Modul penyesuaian inventaris, restock dan retur dari vendor.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
