import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'

export default async function UsersListPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get org id to filter safely (RLS handles this but good practice)
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return <div>Org not found</div>

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', org.id)
    .neq('role', 'superadmin')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage admin, staff, and parent accounts.</p>
        </div>
        <Button asChild>
          <Link href={`/${orgSlug}/users/invite`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left">
                  <tr>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Role</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Division</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Phone</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-medium">{user.full_name}</td>
                      <td className="p-4 capitalize">{user.role}</td>
                      <td className="p-4 capitalize">
                        {user.role === 'ortu' ? '-' : <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-xs">{user.division}</span>}
                      </td>
                      <td className="p-4">{user.phone || '-'}</td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!users || users.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">No users found.</td>
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
