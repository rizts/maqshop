import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditSantriForm from './edit-form'

export default async function EditSantriPage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>
}) {
  const { orgSlug, id } = await params
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) notFound()

  const { data: santri, error } = await supabase
    .from('santri')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !santri) notFound()

  return <EditSantriForm santri={santri} />
}
