import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditProdukForm from '@/app/(dashboard)/[orgSlug]/maqshof/produk/[produkId]/edit/edit-form'

export default async function EditProdukPage({
  params,
}: {
  params: Promise<{ orgSlug: string; produkId: string }>
}) {
  const { orgSlug, produkId } = await params
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) notFound()

  const { data: produk, error } = await supabase
    .from('produk')
    .select('*')
    .eq('id', produkId)
    .single()

  if (error || !produk) notFound()

  return <EditProdukForm produk={produk} />
}
