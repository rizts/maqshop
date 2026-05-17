import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { CancelInviteButton } from './cancel-invite-button'
import { ResendInviteButton } from './resend-invite-button'

export default async function UsersListPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get org id to filter safely (RLS handles this but good practice)
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single() as any

  if (!org) return <div>Lembaga tidak ditemukan</div>

  const { data: users } = await (supabase
    .from('profiles') as any)
    .select('*')
    .eq('org_id', org.id)
    .neq('role', 'superadmin')
    .order('created_at', { ascending: false })

  let authMap = new Map()
  try {
    const adminSupabase = createAdminClient()
    const { data: authData } = await adminSupabase.auth.admin.listUsers()
    if (authData?.users) {
      authMap = new Map(authData.users.map((u: any) => [u.id, u]))
    }
  } catch (err) {
    console.error('Error listing auth users:', err)
  }

  // Find owner admin (admin with the oldest created_at)
  const ownerAdmin = users
    ?.filter((u: any) => u.role === 'admin')
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]

  const isCurrentUserOwner = currentUser && ownerAdmin && currentUser.id === ownerAdmin.id

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Kelola akun admin, pengelola, dan wali santri.</p>
        </div>
        <Button asChild>
          <Link href={`/${orgSlug}/users/invite`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Undang Pengguna
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pengguna Terdaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left">
                  <tr>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Nama</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Peran</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Divisi</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">WhatsApp</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user: any) => {
                    const authUser = authMap.get(user.id)
                    const isInvited = authUser && !authUser.last_sign_in_at
                    const isCurrentUser = currentUser && currentUser.id === user.id
                    const isTargetAdmin = user.role === 'admin'
                    const canDelete = !isTargetAdmin || isCurrentUserOwner

                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-4 font-medium">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{user.full_name}</span>
                            {authUser?.email && <span className="text-xs text-muted-foreground font-normal">{authUser.email}</span>}
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          {user.role === 'superadmin' ? 'Super Admin' : 
                           user.role === 'admin' ? 'Admin Pondok' :
                           user.role === 'staff' ? 'Pengelola' : 'Wali Santri'}
                        </td>
                        <td className="p-4 capitalize">
                          {user.role === 'ortu' ? '-' : <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-xs">{user.division}</span>}
                        </td>
                        <td className="p-4">{user.phone || '-'}</td>
                        <td className="p-4">
                          {isInvited ? (
                            <span className="inline-flex rounded-full bg-amber-100 text-amber-700 px-2 py-1 text-xs font-medium">
                              Undangan Pending
                            </span>
                          ) : (
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {user.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {isCurrentUser ? (
                            <span className="inline-flex rounded bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground select-none">Anda</span>
                          ) : (
                            <div className="flex justify-end gap-1">
                              {isInvited && (
                                <ResendInviteButton
                                  userId={user.id}
                                  userName={user.full_name}
                                />
                              )}
                              {canDelete && (
                                <CancelInviteButton 
                                  userId={user.id} 
                                  userName={user.full_name} 
                                  orgSlug={orgSlug} 
                                  isInvited={!!isInvited} 
                                />
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {(!users || users.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">Tidak ada pengguna ditemukan.</td>
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
