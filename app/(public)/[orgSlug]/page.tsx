import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function OrgLandingPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Fetch the organization details based on slug
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single() as any

  if (error || !organization || organization.status !== 'active') {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          {organization.logo_url && (
            <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border">
              <img src={organization.logo_url} alt={organization.name} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            {organization.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Portal Aplikasi Keuangan Pondok
          </p>
        </div>

        <div className="grid gap-4">
          <Button asChild className="w-full">
            <Link href={`/${orgSlug}/login`}>Masuk ke Akun</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={`/${orgSlug}/register`}>Daftar sebagai Wali Santri</Link>
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link href="/" className="text-muted-foreground hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-xs">
            &larr; Kembali ke Portal Utama Deposantri
          </Link>
        </div>

        <p className="px-8 text-center text-[10px] text-slate-400">
          Dengan mengeklik lanjut, Anda menyetujui{' '}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Syarat & Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Kebijakan Privasi
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
