'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2, Building2, User, Mail, Lock, Globe } from 'lucide-react'

export default function GetStartedPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    pondokName: '',
    slug: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Auto-generate slug from pondok name
  useEffect(() => {
    if (formData.pondokName && !formData.slug) {
      const suggestedSlug = formData.pondokName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      setFormData(prev => ({ ...prev, slug: suggestedSlug }))
    }
  }, [formData.pondokName])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }

    if (!formData.slug.match(/^[a-z0-9-]+$/)) {
      toast.error('Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)')
      return
    }

    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'admin',
            pondok_name: formData.pondokName,
            pondok_slug: formData.slug
          }
        }
      })

      if (authError) throw authError
      setIsSuccess(true)
      
    } catch (error: any) {
      if (error.code === 'over_email_send_rate_limit') {
        toast.error('Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.')
      } else {
        toast.error(error.message || 'Pendaftaran pondok gagal.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-emerald-50/30 px-4">
        <div className="w-full max-w-[550px] space-y-8 rounded-3xl border bg-white/80 p-10 text-center shadow-2xl backdrop-blur-xl animate-fade-in-up">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 shadow-inner">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Pendaftaran Berhasil!</h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Pondok <strong>{formData.pondokName}</strong> telah berhasil didaftarkan ke ekosistem digital Deposantri.
            </p>
          </div>
          <div className="bg-emerald-50/50 p-6 rounded-2xl text-sm text-left border border-emerald-100/50">
            <p className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" /> URL Portal Anda:
            </p>
            <div className="bg-white rounded-lg p-3 border border-emerald-200 flex items-center justify-between group">
              <code className="text-emerald-700 font-medium break-all mr-2">
                {window.location.origin}/{formData.slug}/login
              </code>
            </div>
          </div>
          <Button asChild className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Link href={`/${formData.slug}/login`}>
              Masuk ke Portal Pondok
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-emerald-50 px-4 py-20">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-200/50 blur-[120px]" />
      </div>

      <div className="w-full max-w-[650px] space-y-10 rounded-3xl border bg-white/70 p-10 shadow-2xl backdrop-blur-xl animate-fade-in-up">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Mulai Digitalisasi</h1>
            <p className="text-slate-500 text-lg">
              Solusi cerdas manajemen keuangan pondok pesantren masa kini.
            </p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2 mb-4">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-xl text-slate-800">Informasi Pondok</h3>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="pondokName" className="text-slate-700 font-medium ml-1">Nama Pondok Pesantren</Label>
                <div className="relative group">
                  <Input
                    id="pondokName"
                    placeholder="Al-Hidayah"
                    required
                    value={formData.pondokName}
                    onChange={(e) => setFormData({...formData, pondokName: e.target.value})}
                    className="h-12 bg-white/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="slug" className="text-slate-700 font-medium ml-1">Slug / ID URL</Label>
                <div className="relative flex items-center group">
                  <span className="absolute left-3 text-xs font-semibold text-slate-400 pointer-events-none">
                    id/
                  </span>
                  <Input
                    id="slug"
                    placeholder="al-hidayah"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="h-12 pl-8 bg-white/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2 mb-4">
              <User className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-xl text-slate-800">Pengelola (Admin)</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700 font-medium ml-1 text-sm">Nama Lengkap</Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    id="fullName"
                    placeholder="Nama Lengkap Anda"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="h-12 pl-11 bg-white/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium ml-1 text-sm">Email Aktif</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@pondok.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 pl-11 bg-white/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="password" title="Password" className="text-slate-700 font-medium ml-1 text-sm">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-12 pl-11 bg-white/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" title="Konfirmasi Password" className="text-slate-700 font-medium ml-1 text-sm">Konfirmasi Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="h-12 pl-11 bg-white/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-emerald-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] mt-4" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Mendaftarkan...
              </span>
            ) : 'Daftarkan Pondok Sekarang'}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-4 text-center text-slate-500 pt-2 font-medium">
          <p>
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
              Login di sini
            </Link>
          </p>
          <div className="pt-4 border-t border-slate-100 w-full">
            <Link href="/" className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
