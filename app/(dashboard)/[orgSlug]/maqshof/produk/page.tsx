import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Search, ArrowLeft, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import DeleteProductButton from './delete-button'
import { formatCurrency } from '@/lib/utils/currency'

export default async function ProdukListPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { orgSlug } = await params
  const { q } = await searchParams
  
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) return <div>Tenant Not Found</div>

  // Fetch Produk
  let query = supabase
    .from('produk')
    .select('*')
    .eq('org_id', org.id)
    .order('nama', { ascending: true })

  if (q) {
    query = query.ilike('nama', `%${q}%`)
  }

  const { data: produkList } = await query

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgSlug}/maqshof`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Produk</h1>
            <p className="text-muted-foreground">Kelola daftar jualan maqshof.</p>
          </div>
          <Button asChild>
            <Link href={`/${orgSlug}/maqshof/produk/tambah`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Produk
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
          <div className="pt-2 max-w-sm">
            <form className="flex w-full items-center gap-2">
              <Input 
                type="search" 
                name="q" 
                placeholder="Cari nama produk..." 
                defaultValue={q} 
              />
              <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground w-12">No</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Nama Produk</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Harga Modal</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Harga Jual</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right border-l">Sisa Qty (Stok)</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-center border-l w-24">Status</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-center border-l w-32">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produkList?.map((p, index) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-muted-foreground">{index + 1}</td>
                    <td className="p-4 font-medium">{p.nama}</td>
                    <td className="p-4 text-right text-muted-foreground border-l hover:text-foreground">
                      {formatCurrency(p.harga_beli || 0)}
                    </td>
                    <td className="p-4 text-right font-medium text-primary border-l">
                      {formatCurrency(p.harga_jual)}
                    </td>
                    <td className={`p-4 text-right font-bold border-l ${p.stok <= 5 ? 'text-orange-500' : ''}`}>
                      {p.stok}
                    </td>
                    <td className="p-4 text-center border-l">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider
                        ${p.aktif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {p.aktif ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="p-4 text-center border-l">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                          <Link href={`/${orgSlug}/maqshof/produk/${p.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton 
                          produkId={p.id} 
                          produkNama={p.nama} 
                          orgSlug={orgSlug} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {(!produkList || produkList.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada produk ditemukan.</td>
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
