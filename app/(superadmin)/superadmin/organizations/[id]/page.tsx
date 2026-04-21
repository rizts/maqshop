import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { updateTenantStatus } from './actions'

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !org) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/superadmin/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Basic information about this tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <div className="text-muted-foreground">Name</div>
              <div className="col-span-2 font-medium">{org.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <div className="text-muted-foreground">URL Slug</div>
              <div className="col-span-2 font-medium">{org.slug}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <div className="text-muted-foreground">Status</div>
              <div className="col-span-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  org.status === 'active' ? 'bg-green-100 text-green-800' : 
                  org.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {org.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Control</CardTitle>
            <CardDescription>Suspend or activate this tenant's access to the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateTenantStatus}>
              <input type="hidden" name="id" value={org.id} />
              <input type="hidden" name="status" value={org.status === 'active' ? 'suspended' : 'active'} />
              <Button 
                type="submit" 
                variant={org.status === 'active' ? 'destructive' : 'default'}
              >
                {org.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
