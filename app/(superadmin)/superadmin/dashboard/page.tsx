import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Building2, Users } from 'lucide-react'
import { format } from 'date-fns'

export default async function SuperadminDashboard() {
  const supabase = await createClient()

  // Get organizations list and basic stats
  const { data: organizations, error } = await (supabase
    .from('organizations') as any)
    .select('*, profiles(id)')

  // Total santri across platform
  const { count: totalSantri } = await (supabase
    .from('santri') as any)
    .select('*', { count: 'exact', head: true })

  const totalOrgs = organizations?.length || 0
  const activeOrgs = organizations?.filter((org: any) => org.status === 'active').length || 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ringkasan Platform</h1>
        <Button asChild>
          <Link href="/superadmin/organizations/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Lembaga
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lembaga</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrgs}</div>
            <p className="text-xs text-muted-foreground">
              {activeOrgs} lembaga aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri Platform</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSantri || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total santri terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Lembaga Terbaru</h2>
        <div className="rounded-md border bg-white">
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Nama</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Slug</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Dibuat Pada</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {organizations?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Lembaga tidak ditemukan</td>
                  </tr>
                ) : (
                  organizations?.map((org: any) => (
                    <tr key={org.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{org.name}</td>
                      <td className="p-4 align-middle text-muted-foreground">{org.slug}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' : 
                          org.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right text-muted-foreground">
                        {format(new Date(org.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/superadmin/organizations/${org.id}`}>Kelola</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
