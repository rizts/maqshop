import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Wallet, FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils/currency'

export default async function TabunganDashboardPage({
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
  if (!org) return <div>Lembaga tidak ditemukan</div>

  // Total accumulative stats for the org (or division)
  const { data: globalTabungan } = await supabase
    .from('tabungan')
    .select('saldo, total_deposit, total_keluar')
    .eq('org_id', org.id)
    
  const totalSaldoOrg = globalTabungan?.reduce((acc, curr) => acc + Number(curr.saldo), 0) || 0
  const totalDeposit = globalTabungan?.reduce((acc, curr) => acc + Number(curr.total_deposit), 0) || 0
  
  // Pending Top-ups Count
  const { count: pendingTopups } = await supabase
    .from('topup_requests')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id)
    .eq('status', 'pending')

  // Search tabungan
  let query = supabase
    .from('tabungan')
    .select('*, santri(id, full_name, nis, kelas, kamar, gender)')
    .eq('org_id', org.id)
    .order('saldo', { ascending: false })
    
  if (q) {
    query = query.ilike('santri.full_name', `%${q}%`)
  }

  const { data: tabunganListRaw } = await query
  // Since we used ilike on a joined table, we need to filter out null relations that supabase returns when inner join fails
  const tabunganList = tabunganListRaw?.filter(t => t.santri !== null)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Tabungan</h1>
          <p className="text-muted-foreground">Monitoring saldo santri dan pengajuan top-up.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${orgSlug}/tabungan/deposit`}>
              <CreditCard className="mr-2 h-4 w-4" />
              Deposit Langsung
            </Link>
          </Button>
          <Button asChild>
             <Link href={`/${orgSlug}/tabungan/tarik`}>
              <Wallet className="mr-2 h-4 w-4" />
              Penarikan Dana
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Dana Mengendap</CardTitle>
             <Wallet className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatCurrency(totalSaldoOrg)}</div>
             <p className="text-xs text-muted-foreground">Akumulasi saldo seluruh santri</p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Permintaan Top-up</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{pendingTopups || 0}</div>
             <p className="text-xs text-muted-foreground">Menunggu persetujuan admin</p>
             {pendingTopups ? (
               <Button variant="link" className="p-0 h-auto mt-1" asChild>
                 <Link href={`/${orgSlug}/tabungan/topup-requests`}>Review Now &rarr;</Link>
               </Button>
             ) : null}
           </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekening Santri</CardTitle>
          <CardDescription>Cari untuk melakukan aksi spesifik ke satu santri.</CardDescription>
          <div className="pt-2 max-w-sm">
             <form className="flex w-full items-center gap-2">
                <Input 
                  type="search" 
                  name="q" 
                  placeholder="Cari nama santri..." 
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
                  <th className="h-10 px-4 font-medium text-muted-foreground">NIS/Nama Lengkap</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground">Kelas</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Total Masuk</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Total Keluar</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-right">Saldo Terkini</th>
                  <th className="h-10 px-4 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {tabunganList?.map((t: any) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4">
                      <p className="font-medium">{t.santri.full_name}</p>
                      <p className="text-xs text-muted-foreground">{t.santri.nis}</p>
                    </td>
                    <td className="p-4">{t.santri.kelas}</td>
                    <td className="p-4 text-right">{formatCurrency(t.total_deposit)}</td>
                    <td className="p-4 text-right">{formatCurrency(t.total_keluar)}</td>
                    <td className="p-4 text-right font-medium text-primary">{formatCurrency(t.saldo)}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${orgSlug}/tabungan/deposit?santri_id=${t.santri.id}`}>+</Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${orgSlug}/tabungan/${t.santri.id}`}>Riwayat</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!tabunganList || tabunganList.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada rekening ditemukan.</td>
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
