import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { StokMutationForm } from './stok-form'

export default async function StokMutasiPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any

  // Fetch Products for the form
  const { data: products } = await (supabase
    .from('produk') as any)
    .select('id, nama, stok, satuan')
    .eq('org_id', org?.id)
    .eq('aktif', true)
    .order('nama', { ascending: true })

  // Fetch Stock Logs
  const { data: logs } = await (supabase
    .from('stok_log') as any)
    .select(`
      *,
      produk (nama, satuan),
      pembuat:profiles!dibuat_oleh (full_name)
    `)
    .eq('org_id', org?.id)
    .order('created_at', { ascending: false })
    .limit(100)

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
            <h1 className="text-3xl font-bold tracking-tight">Mutasi & Stok Produk</h1>
            <p className="text-muted-foreground">Log aktivitas inventory: restock, penyesuaian, dan stok keluar.</p>
          </div>
        </div>
        
        <StokMutationForm 
          products={products || []} 
          orgId={org?.id} 
          orgSlug={orgSlug} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histori Mutasi Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Waktu</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Produk</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Jenis</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Qty/Aksi</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Sebelum</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Sesudah</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground border-l">Keterangan</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">User</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log: any) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 whitespace-nowrap">{format(new Date(log.created_at), 'dd MMM yy, HH:mm')}</td>
                    <td className="p-4 font-medium">{log.produk?.nama}</td>
                    <td className="p-4">
                      {log.tipe === 'masuk' && (
                        <span className="flex items-center text-green-600">
                          <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" /> Masuk
                        </span>
                      )}
                      {log.tipe === 'keluar' && (
                        <span className="flex items-center text-red-600">
                          <ArrowDownCircle className="mr-1.5 h-3.5 w-3.5" /> Keluar
                        </span>
                      )}
                      {log.tipe === 'koreksi' && (
                        <span className="flex items-center text-blue-600">
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Koreksi
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {log.tipe === 'masuk' ? '+' : log.tipe === 'keluar' ? '-' : ''}
                      {log.qty} {log.produk?.satuan}
                    </td>
                    <td className="p-4 text-right text-muted-foreground border-l">{log.stok_sebelum}</td>
                    <td className="p-4 text-right font-bold">{log.stok_sesudah}</td>
                    <td className="p-4 border-l max-w-[200px] truncate">{log.keterangan}</td>
                    <td className="p-4 text-muted-foreground truncate">{log.pembuat?.full_name || 'System'}</td>
                  </tr>
                ))}
                {(!logs || logs.length === 0) && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">Belum ada catatan mutasi stok.</td>
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
