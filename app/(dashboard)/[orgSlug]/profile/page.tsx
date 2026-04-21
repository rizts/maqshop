import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Profile } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Middleware and layout ensure auth exists
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return <div>User not found</div>

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  if (!profile) return <div>Profile not found</div>

  return (
    <div className="flex flex-col gap-8 max-w-3xl animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-slate-500">Manage your personal information and preferences.</p>
      </div>

      <Card className="rounded-2xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Personal Information</CardTitle>
          <CardDescription>Your profile details used across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-3xl">
                {profile.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{profile.role}</p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-700">Full Name</Label>
                <Input 
                  id="full_name" 
                  defaultValue={profile.full_name} 
                  readOnly
                  className="bg-slate-50/50 cursor-not-allowed"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <Input 
                  id="email" 
                  defaultValue={user.email} 
                  readOnly 
                  className="bg-slate-50/50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="division" className="text-slate-700">Division</Label>
                <Input 
                  id="division" 
                  defaultValue={profile.division} 
                  readOnly 
                  className="bg-slate-50/50 cursor-not-allowed capitalize"
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4">
            <p className="text-sm text-blue-800">
              Personal profile editing is currently restricted. Please contact your Superadmin to update this information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
