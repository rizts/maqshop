'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores/auth.store'
import type { Profile, Organization } from '@/types'
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  ShoppingCart, 
  FileText, 
  Settings,
  Store // Ensure this is imported properly later if needed. For now using basic ones.
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

export function Sidebar({ 
  orgSlug, 
  initialProfile, 
  initialOrganization 
}: { 
  orgSlug?: string, 
  initialProfile?: Profile | null,
  initialOrganization?: Organization | null
}) {
  const pathname = usePathname()
  const { profile: storeProfile, organization: storeOrganization } = useAuthStore()
  
  const profile = storeProfile || initialProfile
  const organization = storeOrganization || initialOrganization
  
  if (!profile) return null

  const isSuperadmin = profile.role === 'superadmin'

  // Define navigation items
  let navItems: NavItem[] = []

  if (isSuperadmin) {
    navItems = [
      { title: 'Dashboard', href: '/superadmin/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['superadmin'] },
      { title: 'Organizations', href: '/superadmin/organizations', icon: <Building2 className="h-4 w-4" />, roles: ['superadmin'] },
      { title: 'Platform Users', href: '/superadmin/users', icon: <Users className="h-4 w-4" />, roles: ['superadmin'] },
    ]
  } else if (profile.role === 'ortu') {
    navItems = [
      { title: 'Dashboard', href: `/${orgSlug}/ortu/dashboard`, icon: <LayoutDashboard className="h-4 w-4" />, roles: ['ortu'] },
      { title: 'Top-up Saldo', href: `/${orgSlug}/ortu/topup`, icon: <Wallet className="h-4 w-4" />, roles: ['ortu'] },
      { title: 'Riwayat Jajan', href: `/${orgSlug}/ortu/riwayat`, icon: <FileText className="h-4 w-4" />, roles: ['ortu'] },
    ]
  } else {
    // Admin or Staff
    navItems = [
      { title: 'Dashboard', href: `/${orgSlug}/dashboard`, icon: <LayoutDashboard className="h-4 w-4" />, roles: ['admin', 'staff'] },
      { title: 'Santri', href: `/${orgSlug}/santri`, icon: <Users className="h-4 w-4" />, roles: ['admin', 'staff'] },
      { title: 'Tabungan', href: `/${orgSlug}/tabungan`, icon: <Wallet className="h-4 w-4" />, roles: ['admin', 'staff'] },
      { title: 'Maqshof', href: `/${orgSlug}/maqshof`, icon: <ShoppingCart className="h-4 w-4" />, roles: ['admin', 'staff'] },
      { title: 'Laporan', href: `/${orgSlug}/laporan`, icon: <FileText className="h-4 w-4" />, roles: ['admin'] },
      { title: 'Users', href: `/${orgSlug}/users`, icon: <Users className="h-4 w-4" />, roles: ['admin'] },
      { title: 'Settings', href: `/${orgSlug}/settings`, icon: <Settings className="h-4 w-4" />, roles: ['admin'] },
    ]
  }

  // Filter items by role
  const filteredNavItems = navItems.filter(item => item.roles.includes(profile.role))

  return (
    <aside className="hidden w-64 flex-col border-r bg-slate-50 md:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link href={isSuperadmin ? '/superadmin/dashboard' : `/${orgSlug}/dashboard`} className="flex items-center gap-2 font-semibold">
          {organization?.logo_url ? (
            <img src={organization.logo_url} alt="Logo" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-primary" />
          )}
          <span className="truncate">{organization?.name || 'Deposantri'}</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {filteredNavItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
