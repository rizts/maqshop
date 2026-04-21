import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Middleware already checks auth, but we need to fetch profile and org details
  // and load them into Zustand on the client side. We'll do a simple verify here.
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/${orgSlug}/login`)
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar orgSlug={orgSlug} />
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-0">
        <Header />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
