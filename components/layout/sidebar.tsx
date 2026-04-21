'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useLayoutStore } from '@/lib/stores/layout.store'
import type { Profile, Organization } from '@/types'
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  ShoppingCart, 
  FileText, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Store,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore()
  
  const profile = storeProfile || initialProfile
  const organization = storeOrganization || initialOrganization
  
  if (!profile) return null

  const isSuperadmin = profile.role === 'superadmin'

  // Define navigation items
  let navItems: NavItem[] = []

  if (isSuperadmin) {
    navItems = [
      { title: 'Dashboard', href: '/superadmin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['superadmin'] },
      { title: 'Organizations', href: '/superadmin/organizations', icon: <Building2 className="h-5 w-5" />, roles: ['superadmin'] },
      { title: 'Platform Users', href: '/superadmin/users', icon: <Users className="h-5 w-5" />, roles: ['superadmin'] },
    ]
  } else if (profile.role === 'ortu') {
    navItems = [
      { title: 'Dashboard', href: `/${orgSlug}/ortu/dashboard`, icon: <LayoutDashboard className="h-5 w-5" />, roles: ['ortu'] },
      { title: 'Top-up Saldo', href: `/${orgSlug}/ortu/topup`, icon: <Wallet className="h-5 w-5" />, roles: ['ortu'] },
      { title: 'Riwayat Jajan', href: `/${orgSlug}/ortu/riwayat`, icon: <FileText className="h-5 w-5" />, roles: ['ortu'] },
    ]
  } else {
    // Admin or Staff
    navItems = [
      { title: 'Dashboard', href: `/${orgSlug}/dashboard`, icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin', 'staff'] },
      { title: 'Santri', href: `/${orgSlug}/santri`, icon: <Users className="h-5 w-5" />, roles: ['admin', 'staff'] },
      { title: 'Tabungan', href: `/${orgSlug}/tabungan`, icon: <Wallet className="h-5 w-5" />, roles: ['admin', 'staff'] },
      { title: 'Maqshof', href: `/${orgSlug}/maqshof`, icon: <ShoppingCart className="h-5 w-5" />, roles: ['admin', 'staff'] },
      { title: 'Laporan', href: `/${orgSlug}/laporan`, icon: <FileText className="h-5 w-5" />, roles: ['admin'] },
      { title: 'Users', href: `/${orgSlug}/users`, icon: <Users className="h-5 w-5" />, roles: ['admin'] },
      { title: 'Settings', href: `/${orgSlug}/settings`, icon: <Settings className="h-5 w-5" />, roles: ['admin'] },
    ]
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(profile.role))

  return (
    <aside className={cn(
      "hidden flex-col border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:flex z-40 transition-all duration-300 relative",
      isSidebarCollapsed ? "w-20" : "w-72"
    )}>
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors z-50"
      >
        {isSidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="flex h-20 items-center px-4 overflow-hidden">
        <Link 
          href={isSuperadmin ? '/superadmin/dashboard' : `/${orgSlug}/dashboard`} 
          className={cn("flex items-center gap-3 transition-all", isSidebarCollapsed ? "mx-auto" : "group w-full px-2")}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200 transition-transform group-hover:scale-110">
            {organization?.logo_url ? (
              <img src={organization.logo_url} alt="Logo" className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-white" />
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden opacity-100 transition-opacity duration-300 delay-100">
              <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-wider truncate">
                {organization?.name || 'Deposantri'}
              </span>
              <span className="text-[10px] font-medium text-slate-500">DIGITAL ECOSYSTEM</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6">
        <TooltipProvider delayDuration={0}>
          <nav className="grid gap-1.5 px-3 text-sm font-medium">
            {filteredNavItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const linkContent = (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-xl p-3 transition-all duration-200 outline-none",
                    isActive 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    isSidebarCollapsed ? "justify-center" : "justify-between px-4"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "transition-transform group-hover:scale-110 shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"
                    )}>
                      {item.icon}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap">{item.title}</span>
                    )}
                  </div>
                  {!isSidebarCollapsed && isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70 shrink-0" />}
                </Link>
              )

              if (!isSidebarCollapsed) {
                return linkContent
              }

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={14} className="bg-slate-900 text-white border-slate-800 text-xs font-semibold px-3 py-1.5 shadow-xl rounded-lg">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
        </TooltipProvider>
      </div>

      <div className="p-3 border-t border-slate-100">
        <div className={cn(
          "bg-slate-50 rounded-2xl flex items-center border border-slate-100/50 hover:border-emerald-100 hover:bg-emerald-50/50 transition-all overflow-hidden",
          isSidebarCollapsed ? "p-2 justify-center" : "p-4 gap-3 cursor-pointer"
        )}>
          <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
            {profile.full_name?.[0].toUpperCase()}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-300">
              <p className="text-xs font-bold text-slate-900 truncate">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{profile.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
