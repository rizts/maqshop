'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'

export default function GlobalLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const supabase = createClient()
  const setProfile = useAuthStore(state => state.setProfile)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Fetch detailed profile after login
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*, organizations(*)')
          .eq('id', data.user.id)
          .single() as any

        if (profileError) throw profileError

        setProfile(profile)
        
        // Logical redirection based on user role
        if (profile.role === 'superadmin') {
          router.push('/superadmin/dashboard')
        } else if (profile.organizations?.slug) {
          if (profile.role === 'ortu') {
            router.push(`/${profile.organizations.slug}/ortu/dashboard`)
          } else {
            router.push(`/${profile.organizations.slug}/dashboard`)
          }
        } else {
          // If for some reason they have no org but are not superadmin
          router.push('/')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal login. Periksa kembali email dan password Anda.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[400px] space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Login Platform</h1>
          <p className="text-sm text-muted-foreground">
            Masuk untuk mengakses layanan Deposantri
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sedang masuk...' : 'Masuk'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Atau mendaftar</span>
          </div>
        </div>

        <div className="text-center text-sm">
          <p className="text-muted-foreground mb-4">
            Ingin mendaftarkan pondok Anda?
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/get-started">
              Daftarkan Pondok Baru
            </Link>
          </Button>
        </div>

        <div className="text-center text-sm pt-4 border-t">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
