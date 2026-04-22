'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'

export default function LoginPage() {
  const router = useRouter()
  const params = useParams()
  const orgSlug = params.orgSlug as string
  
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

      // After auth, get the profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*, organizations(*)')
          .eq('id', data.user.id)
          .single() as any

        if (profileError) throw profileError

        // Verify if user belongs to this org or is superadmin
        if (profile.role !== 'superadmin' && profile.organizations?.slug !== orgSlug) {
           await supabase.auth.signOut()
           throw new Error("Anda tidak memiliki akses ke lembaga ini.")
        }
        
        setProfile(profile)
        
        // Redirect logic based on role
        if (profile.role === 'superadmin') {
          router.push('/superadmin/dashboard')
        } else if (profile.role === 'ortu') {
          router.push(`/${orgSlug}/ortu/dashboard`)
        } else {
          router.push(`/${orgSlug}/dashboard`)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal masuk')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[400px] space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Masuk ke Portal</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan email dan kata sandi Anda untuk mengakses portal {orgSlug}
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

        <div className="text-center text-sm">
          <Link href={`/${orgSlug}`} className="text-muted-foreground hover:text-primary">
            &larr; Kembali ke portal {orgSlug}
          </Link>
        </div>
      </div>
    </div>
  )
}
