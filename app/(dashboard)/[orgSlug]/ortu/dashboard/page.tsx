import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Info, FileText, ArrowUpRight, Upload } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format } from 'date-fns'

export default async function OrtuDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get user profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Sesi berakhir. Silakan login kembali.</div>

  // Fetch children (santri) tied to this guardian
  const { data: childrenRaw } = await supabase
    .from('guardian_santri')
    .select(`
      santri (
        id, full_name, nis, kelas, kamar,
        tabungan (saldo)
      )
    `)
    .eq('guardian_id', user.id)

  const children = childrenRaw?.map((r: any) => r.santri) || []

  // Pending topup requests for this org
  const { count: pendingTopups } = await supabase
    .from('topup_requests')
    .select('*', { count: 'exact', head: true })
    .eq('pengaju_id', user.id)
    .eq('status', 'pending')

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Wali Santri</h1>
        <p className="text-muted-foreground">Pantau saldo tabungan dan riwayat belanja anak Anda di pondok.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anak Tersambung</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{children.length}</div>
             <p className="text-xs text-muted-foreground mt-1">
               Jika data anak tidak sesuai, silakan hubungi admin pondok.
             </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pengajuan Top-up (Diproses)</CardTitle>
             <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-orange-500">{pendingTopups || 0}</div>
             <p className="text-xs text-muted-foreground mt-1">
               Menunggu verifikasi admin keuangan pondok.
             </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-bold tracking-tight">Data Santri & Tabungan</h2>
        <Button asChild>
           <Link href={`/${orgSlug}/ortu/topup`}>
              <Wallet className="mr-2 h-4 w-4" /> Kirim Uang Saku
           </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children.length === 0 ? (
           <div className="col-span-full p-8 text-center bg-slate-50 border rounded-lg text-muted-foreground">
             Belum ada data anak yang tersambung ke akun Anda.<br/>
             Hubungi admin agar profil anak dihubungkan dengan akun Wali Anda.
           </div>
        ) : (
          children.map((anak: any) => (
             <Card key={anak.id} className="overflow-hidden flex flex-col">
               <CardHeader className="bg-slate-50 border-b pb-4">
                 <CardTitle className="text-lg">{anak.full_name}</CardTitle>
                 <CardDescription>NIS: {anak.nis || '-'} • Kelas {anak.kelas || '-'}</CardDescription>
               </CardHeader>
               <CardContent className="p-6 flex-1 flex flex-col justify-center items-center gap-2">
                 <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Sisa Tabungan</div>
                 <div className="text-3xl font-bold text-primary">
                    {formatCurrency(anak.tabungan?.saldo || 0)}
                 </div>
               </CardContent>
               <CardFooter className="bg-slate-50 border-t p-0">
                  <Button variant="ghost" className="w-full rounded-none h-12" asChild>
                    <Link href={`/${orgSlug}/ortu/riwayat?santri_id=${anak.id}`}>
                      Lihat Mutasi Jajan &rarr;
                    </Link>
                  </Button>
               </CardFooter>
             </Card>
          ))
        )}
      </div>
    </div>
  )
}
