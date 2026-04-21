'use client'

import { useAuthStore } from '@/lib/stores/auth.store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User, Settings as SettingsIcon } from 'lucide-react'

export function Header() {
  const { user, profile, organization, clearAuth } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearAuth()
    
    // Redirect logic
    if (profile?.role === 'superadmin') {
      router.push('/')
    } else if (organization?.slug) {
      router.push(`/${organization.slug}/login`)
    } else {
      router.push('/')
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-md px-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-xl font-bold md:hidden text-emerald-700 uppercase tracking-tight">
          {organization?.name || 'Deposantri'}
        </h1>
        <div className="hidden md:flex flex-col">
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Ringkasan Dashboard</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Manajemen Pondok Pesantren</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white" />
        </Button>
        
        <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-3 pl-2 pr-4 h-12 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
              <Avatar className="h-9 w-9 border-2 border-emerald-100 shadow-sm transition-transform group-hover:scale-105">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name} />}
                <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start min-w-[100px]">
                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-none mb-1">{profile?.full_name}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter capitalize">
                  {profile?.role === 'superadmin' ? 'Super Admin' : 
                   profile?.role === 'admin' ? 'Admin Pondok' :
                   profile?.role === 'staff' ? 'Pengelola' : 'Wali Santri'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2 rounded-xl shadow-xl border-slate-100" align="end" forceMount>
            <DropdownMenuLabel className="p-4 font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-slate-900">{profile?.full_name}</p>
                <p className="text-xs leading-none text-slate-500 truncate mt-1">
                  {user?.email || 'admin@deposantri.id'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2 bg-slate-50" />
            <div className="p-1">
              <DropdownMenuItem 
                onClick={() => {
                  if (profile?.role === 'superadmin') {
                    router.push('/superadmin/profile')
                  } else if (organization?.slug) {
                    router.push(`/${organization.slug}/profile`)
                  }
                }}
                className="rounded-lg px-3 py-2 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 group transition-colors"
              >
                <User className="mr-2 h-4 w-4 text-slate-400 group-focus:text-emerald-600" />
                <span>Profil Saya</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (profile?.role === 'superadmin') {
                    router.push('/superadmin/dashboard')
                  } else if (organization?.slug) {
                    router.push(`/${organization.slug}/settings`)
                  }
                }}
                className="rounded-lg px-3 py-2 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 group transition-colors"
              >
                <SettingsIcon className="mr-2 h-4 w-4 text-slate-400 group-focus:text-emerald-600" />
                <span>Pengaturan Akun</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="mx-2 bg-slate-50" />
            <div className="p-1">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 cursor-pointer focus:bg-red-50 focus:text-red-600 text-red-500 group transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-semibold">Keluar</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
