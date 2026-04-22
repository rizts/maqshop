import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function SantriListPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { orgSlug } = await params
  const { q, status } = await searchParams
  
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any
  if (!org) return <div>Lembaga tidak ditemukan</div>

  // Fetch Santri. RLS automatically filters by division !
  let query = (supabase.from('santri') as any)
    .select('*, tabungan(saldo)')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('full_name', `%${q}%`)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: santriList } = await query

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Santri</h1>
          <p className="text-muted-foreground">Kelola santri dan akun mereka.</p>
        </div>
        <Button asChild>
          <Link href={`/${orgSlug}/santri/tambah`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Santri
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <form className="flex w-full items-center gap-2 max-w-sm">
              <Input 
                type="search" 
                name="q" 
                placeholder="Cari nama..." 
                defaultValue={q} 
              />
              <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            {/* Simple static filter visualization */}
            <div className="text-sm text-muted-foreground ml-auto bg-muted px-3 py-1.5 rounded-md">
              <span className="font-medium text-foreground">{santriList?.length || 0}</span> santri ditemukan
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="h-10 px-4 font-medium text-muted-foreground">NIS</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Nama Lengkap</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Gender</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Kelas / Kamar</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Saldo Tabungan</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-center">Status</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {santriList?.map((s: any) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4">{s.nis || '-'}</td>
                    <td className="p-4 font-medium">{s.full_name}</td>
                    <td className="p-4 capitalize">{s.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td className="p-4">{s.kelas || '-'} / {s.kamar || '-'}</td>
                    <td className="p-4 text-right font-medium">
                      Rp {new Intl.NumberFormat('id-ID').format(s.tabungan?.saldo || 0)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {s.status === 'active' ? 'Aktif' : s.status === 'alumni' ? 'Alumni' : 'Keluar'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${orgSlug}/santri/${s.id}`}>Detail</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!santriList || santriList.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada data santri.</td>
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
