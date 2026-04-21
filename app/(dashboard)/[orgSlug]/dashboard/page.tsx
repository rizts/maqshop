import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Wallet, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Find org id
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .single()

  if (!org) return <div>Org not found</div>

  const orgId = org.id

  // Stats: Total Santri
  const { count: totalSantri } = await supabase
    .from('santri')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)

  // Stats: Tabungan
  const { data: tabunganStats } = await supabase
    .from('tabungan')
    .select('saldo')
    .eq('org_id', orgId)

  const totalTabungan = tabunganStats?.reduce((acc, curr) => acc + Number(curr.saldo), 0) || 0

  // Stats: POS Sales Today
  const today = new Date().toISOString().split('T')[0]
  const { data: posToday } = await supabase
    .from('pos_transaksi')
    .select('total')
    .eq('org_id', orgId)
    .eq('status', 'success')
    .gte('created_at', today)

  const totalPosToday = posToday?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSantri || 0}</div>
            <p className="text-xs text-muted-foreground">Active in this tenant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tabungan</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTabungan)}</div>
            <p className="text-xs text-muted-foreground">Akumulasi saldo santri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Maqshof (Hari ini)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPosToday)}</div>
            <p className="text-xs text-muted-foreground">Nilai transaksi berhasil</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Recent Transactions / Quick Actions if needed later */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview Tabungan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex justify-center items-center h-[300px] text-muted-foreground">
            Chart will be displayed here
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Top-up Requests</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px] text-muted-foreground">
            No pending requests
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
