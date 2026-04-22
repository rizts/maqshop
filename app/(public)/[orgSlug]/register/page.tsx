'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const params = useParams()
  const orgSlug = params.orgSlug as string
  
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Kata sandi tidak cocok')
      return
    }

    setIsLoading(true)

    try {
      // 1. Get org id from slug (still needed for the metadata)
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single() as any

      if (orgError) throw new Error('Lembaga tidak ditemukan')

      // 2. Sign up user - Metadata will trigger profile creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            org_id: org.id,
            role: 'ortu'
          }
        }
      })

      if (authError) throw authError

      setIsSuccess(true)
      
    } catch (error: any) {
      if (error.code === 'over_email_send_rate_limit') {
        toast.error('Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.')
      } else {
        toast.error(error.message || 'Pendaftaran gagal')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-[400px] space-y-6 rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Pendaftaran Berhasil</h1>
          <p className="text-muted-foreground">
            Akun Anda telah dibuat. Sekarang Anda dapat masuk ke portal.
          </p>
          <Button asChild className="w-full mt-4">
            <Link href={`/${orgSlug}/login`}>Masuk ke Portal</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-[450px] space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Daftar sebagai Wali Santri</h1>
          <p className="text-sm text-muted-foreground">
            Buat akun untuk memantau tabungan anak Anda di {orgSlug}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Contoh: Budi Santoso"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="081234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="nama@contoh.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Mendaftarkan akun...' : 'Daftar'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Sudah memiliki akun?{' '}
          <Link href={`/${orgSlug}/login`} className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link href={`/${orgSlug}`} className="text-muted-foreground hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-xs">
            &larr; Kembali ke portal {orgSlug}
          </Link>
        </div>
      </div>
    </div>
  )
}
