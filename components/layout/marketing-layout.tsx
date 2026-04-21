'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

interface MarketingLayoutProps {
  children: React.ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md transition-all duration-300 border-b border-slate-100">
        <div className="container mx-auto flex h-20 items-center px-6 lg:px-8">
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200 transition-transform group-hover:scale-110">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
                  Maqshop
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] -mt-1">
                  Ekosistem Digital
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 flex-initial justify-center px-4">
            <Link href="/#features" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Fitur
            </Link>
            <Link href="/#network" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Jaringan
            </Link>
            <Link href="/#contact" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Kontak
            </Link>
            <Link href="/help" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Bantuan
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors mr-2">
              Masuk
            </Link>
            <Button asChild className="rounded-xl px-6 font-bold shadow-lg shadow-emerald-100 transition-all hover:scale-105 active:scale-95">
              <Link href="/get-started">Daftar Pondok</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 pb-12 pt-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Maqshop</span>
              </Link>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                Membangun masa depan pesantren yang lebih mandiri dan transparan melalui teknologi digital yang mudah digunakan oleh seluruh santri dan pengelola.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/#features" className="hover:text-emerald-600 transition-colors">Semua Fitur</Link></li>
                <li><Link href="/get-started" className="hover:text-emerald-600 transition-colors">Daftar Pondok</Link></li>
                <li><Link href="/login" className="hover:text-emerald-600 transition-colors">Login Admin</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/help" className="hover:text-emerald-600 transition-colors">Bantuan</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs text-center md:text-left">
              &copy; {new Date().getFullYear()} Maqshop. Dilindungi Hak Cipta. Dikembangkan oleh Tim Teknologi Islamic Ecosystem.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Instagram</Link>
              <Link href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Twitter</Link>
              <Link href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">YouTube</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
