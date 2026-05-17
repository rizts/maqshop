'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, KeyRound } from 'lucide-react'

export default function SetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      // 1. Manually parse hash if present (Implicit Flow from Supabase Auth)
      // This is the most bulletproof way to handle the invite redirect in Next.js SSR
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
        const hashStr = window.location.hash.substring(1)
        const params = new URLSearchParams(hashStr)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
          // Clear the hash immediately so we don't process it again
          window.history.replaceState(null, '', window.location.pathname + window.location.search)

          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })

          if (error) {
            console.error('Manual setSession error:', error)
            if (mounted) {
              toast.error('Gagal mengaktifkan sesi dari tautan undangan.')
              router.push('/login')
            }
            return
          }

          if (mounted && data.session?.user) {
            setUser(data.session.user)
            setIsCheckingSession(false)
            return
          }
        }
      }

      // 2. If no hash, try to get existing session (from cookies via SSR / PKCE)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session?.user) {
        if (mounted) {
          setUser(session.user)
          setIsCheckingSession(false)
        }
      } else {
        if (mounted) {
          toast.error('Sesi tidak valid atau telah kedaluwarsa. Silakan minta undangan baru.')
          router.push('/login')
        }
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      toast.error('Kata sandi wajib diisi')
      return
    }

    if (password.length < 6) {
      toast.error('Kata sandi harus minimal 6 karakter')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok')
      return
    }

    setIsLoading(true)
    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success('Kata sandi berhasil dikonfigurasi!')

      // Fetch user's organization slug to redirect them correctly
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single() as any

      if (profile?.org_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('slug')
          .eq('id', profile.org_id)
          .single() as any

        if (org?.slug) {
          router.push(`/${org.slug}`)
          return
        }
      }

      router.push('/')
    } catch (error: any) {
      console.error('Error setting password:', error)
      toast.error(error.message || 'Gagal mengatur kata sandi')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memeriksa sesi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-slate-200/80 shadow-xl bg-white">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <KeyRound className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Atur Kata Sandi</CardTitle>
          <CardDescription>
            Selamat datang! Silakan buat kata sandi untuk akun baru Anda agar dapat masuk di lain waktu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi Baru</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan & Masuk Ke Dashboard'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
