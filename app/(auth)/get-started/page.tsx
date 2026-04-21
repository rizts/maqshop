'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2, Building2 } from 'lucide-react'

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
      // Call signUp with metadata that triggers the database-level registration
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
      
      // If sign up is successful, the trigger has already created the org and profile.
      // If email confirmation is off, authData.user will be present.
      // If email confirmation is on, we still consider it a "success" state for the UI.
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-[500px] space-y-6 rounded-xl border bg-white p-10 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Pendaftaran Berhasil!</h1>
            <p className="text-muted-foreground text-lg">
              Pondok <strong>{formData.pondokName}</strong> telah berhasil didaftarkan.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-left border">
            <p className="font-medium mb-1">URL Portal Anda:</p>
            <code className="text-primary break-all">
              {window.location.origin}/{formData.slug}/login
            </code>
          </div>
          <Button asChild className="w-full h-12 text-lg">
            <Link href={`/${formData.slug}/login`}>
              Masuk ke Portal Pondok
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[600px] space-y-8 rounded-2xl border bg-white p-10 shadow-xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Daftarkan Pondok Anda</h1>
          <p className="text-muted-foreground">
            Langkah awal menuju digitalisasi keuangan pesantren yang terpadu.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-lg">Informasi Pondok</h3>
            <div className="space-y-2">
              <Label htmlFor="pondokName">Nama Pondok Pesantren</Label>
              <Input
                id="pondokName"
                placeholder="Contoh: Pondok Pesantren Al-Hidayah"
                required
                value={formData.pondokName}
                onChange={(e) => setFormData({...formData, pondokName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug / ID URL (Hanya huruf, angka, dan -)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground bg-slate-100 px-3 py-2 rounded border">
                  deposantri.id/
                </span>
                <Input
                  id="slug"
                  placeholder="al-hidayah"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                />
              </div>
              <p className="text-[12px] text-muted-foreground">
                URL ini akan digunakan untuk akses wali santri dan staff: deposantri.id/<strong>{formData.slug || 'slug-anda'}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Pengelola (Admin)</h3>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap Pengelola</Label>
              <Input
                id="fullName"
                placeholder="Nama Lengkap"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Admin</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pondok.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
            {isLoading ? 'Sedang mendaftarkan...' : 'Daftarkan Pondok Sekarang'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Sudah terdaftar?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
