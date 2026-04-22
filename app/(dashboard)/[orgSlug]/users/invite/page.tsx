import { createClient } from '@/lib/supabase/server'
import { InviteForm } from './invite-form'
import { notFound } from 'next/navigation'

interface InvitePageProps {
  params: Promise<{
    orgSlug: string
  }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Fetch organization ID by slug
  const { data: organization, error } = await (supabase
    .from('organizations') as any)
    .select('id, name')
    .eq('slug', orgSlug)
    .single()

  if (error || !organization) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 px-4 md:px-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Undang Pengguna</h1>
        <p className="text-slate-500 text-sm md:text-base">
          Dashboard <span className="font-semibold text-emerald-600">{organization.name}</span>
        </p>
      </div>

      <InviteForm orgSlug={orgSlug} orgId={organization.id} />
    </div>
  )
}
