'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, UserPlus, Mail, ShieldCheck, Layers, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { inviteUser } from './actions'

interface InviteFormProps {
  orgSlug: string
  orgId: string
}

export function InviteForm({ orgSlug, orgId }: InviteFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    formData.append('orgSlug', orgSlug)
    formData.append('orgId', orgId)

    const result = await inviteUser(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    } else {
      toast.success('Undangan berhasil dikirim!')
      router.push(`/${orgSlug}/users`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link 
        href={`/${orgSlug}/users`}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors mb-6 group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Daftar Pengguna
      </Link>

      <Card className="border-slate-200 shadow-xl overflow-hidden rounded-3xl">
        <div className="h-2 bg-emerald-500 w-full" />
        <CardHeader className="p-8">
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Undang Pengguna Baru</CardTitle>
          <CardDescription className="text-slate-500 mt-2">
            Kirim undangan email kepada anggota tim atau wali santri untuk bergabung ke platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Nama Lengkap</Label>
                <div className="relative">
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    placeholder="Contoh: Ahmad Fauzi" 
                    required 
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserPlus className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Alamat Email</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="ahmad@email.com" 
                    required 
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700">Peran (Role)</Label>
                <Select name="role" defaultValue="staff" required>
                  <SelectTrigger id="role" className="h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all pl-10 relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 p-1">
                    <SelectItem value="admin" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-700">Admin Pondok</SelectItem>
                    <SelectItem value="staff" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-700">Pengelola</SelectItem>
                    <SelectItem value="ortu" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-700">Wali Santri</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division" className="text-sm font-semibold text-slate-700">Divisi</Label>
                <Select name="division" defaultValue="all" required>
                  <SelectTrigger id="division" className="h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all pl-10 relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                      <Layers className="h-4 w-4" />
                    </div>
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 p-1">
                    <SelectItem value="all" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-700">Semua (Umum)</SelectItem>
                    <SelectItem value="banin" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-700">Banin (Putra)</SelectItem>
                    <SelectItem value="banat" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-700">Banat (Putri)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mengirim Undangan...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Kirim Undangan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
