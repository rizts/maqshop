import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wallet, Calendar, Info, Edit, CreditCard, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format } from 'date-fns'
import GuardianManager from './guardian-manager'

export default async function SantriDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>
}) {
  const { orgSlug, id } = await params
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single() as any
  if (!org) notFound()

  // Fetch Santri and related data
  const { data: santri, error } = await supabase
    .from('santri')
    .select(`
      *,
      tabungan (*),
      guardian_santri (
        id,
        relationship,
        guardian:profiles (id, full_name, phone)
      )
    `)
    .eq('id', id)
    .single() as any

  if (error || !santri) notFound()

  // Fetch potential guardians (role = 'ortu') in the same org
  const { data: potentialGuardians } = await (supabase
    .from('profiles') as any)
    .select('id, full_name')
    .eq('org_id', org.id)
    .eq('role', 'ortu')
    .order('full_name')

  // Fetch recent transactions (limit 5)
  const { data: recentTrx } = await (supabase
    .from('transaksi_tabungan') as any)
    .select('*')
    .eq('santri_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/${orgSlug}/santri`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{santri.full_name}</h1>
            <p className="text-muted-foreground">NIS: {santri.nis || '-'}</p>
          </div>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/${orgSlug}/santri/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profil
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Papan Informasi Utama Tabungan */}
        <Card className="col-span-full md:col-span-1 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground/80 text-sm font-medium">Saldo Tabungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">
              {formatCurrency(santri.tabungan?.saldo || 0)}
            </div>
            <div className="text-sm text-primary-foreground/70">
              Update terakhir: {santri.tabungan?.updated_at ? format(new Date(santri.tabungan.updated_at), 'dd MMM yyyy, HH:mm') : '-'}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/${orgSlug}/tabungan/deposit?santri_id=${santri.id}`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Top-up
              </Link>
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/${orgSlug}/tabungan/tarik?santri_id=${santri.id}`}>
                <Wallet className="mr-2 h-4 w-4" />
                Tarik
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Informasi Pribadi */}
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" /> Informasi Santri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Divisi/Gender</p>
                <p className="font-medium capitalize">{santri.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{santri.status === 'active' ? 'Aktif' : santri.status === 'alumni' ? 'Alumni' : 'Keluar'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kelas</p>
                <p className="font-medium">{santri.kelas || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kamar/Asrama</p>
                <p className="font-medium">{santri.kamar || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tahun Masuk</p>
                <p className="font-medium">{santri.tahun_masuk || '-'}</p>
              </div>
              <div className="col-span-full mt-4 border-t pt-6">
                <GuardianManager 
                  santriId={santri.id}
                  orgId={org.id}
                  orgSlug={orgSlug}
                  currentGuardians={santri.guardian_santri || []}
                  potentialGuardians={potentialGuardians || []}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaksi Terakhir */}
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Riwayat Transaksi Terakhir</CardTitle>
            <Button variant="outline" size="sm" asChild>
               <Link href={`/${orgSlug}/tabungan/${santri.id}`}>Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left">
                  <tr>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Tanggal</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Tipe</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Keterangan</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground text-right">Debit/Kredit</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground text-right">Saldo Sesudah</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrx?.map((trx: any) => (
                    <tr key={trx.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">{format(new Date(trx.created_at), 'dd MMM yyyy, HH:mm')}</td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium 
                          ${trx.tipe.includes('deposit') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {trx.tipe === 'deposit_cash' ? 'Deposit Tunai' : 
                           trx.tipe === 'deposit_transfer' ? 'Deposit Transfer' :
                           trx.tipe === 'withdrawal' ? 'Penarikan' :
                           trx.tipe === 'pos_deduct' ? 'Belanja Maqshof' : 'Penyesuaian'}
                        </span>
                      </td>
                      <td className="p-4">{trx.keterangan || '-'}</td>
                      <td className={`p-4 text-right font-medium ${trx.tipe.includes('deposit') ? 'text-green-600' : 'text-red-600'}`}>
                        {trx.tipe.includes('deposit') ? '+' : '-'}{formatCurrency(trx.jumlah)}
                      </td>
                      <td className="p-4 text-right">{formatCurrency(trx.saldo_sesudah)}</td>
                    </tr>
                  ))}
                  {(!recentTrx || recentTrx.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">Belum ada transaksi merekam.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
