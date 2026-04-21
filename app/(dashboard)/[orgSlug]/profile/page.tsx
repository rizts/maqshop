import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { updateProfileName, updatePassword } from './actions'
import type { Profile } from '@/types'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
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
        <p className="text-slate-500">Manage your personal information and security settings.</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="personal" className="rounded-lg px-6 py-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all font-semibold">Personal Info</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6 py-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all font-semibold">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0 outline-none">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <form action={updateProfileName}>
              <input type="hidden" name="orgSlug" value={orgSlug} />
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
                        name="full_name"
                        defaultValue={profile.full_name} 
                        className="bg-white"
                        required
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
                      <p className="text-[10px] text-slate-400">Email cannot be changed directly.</p>
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
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-50 pt-6">
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0 outline-none">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <form action={updatePassword}>
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <CardHeader>
                <CardTitle className="text-xl">Security</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-slate-700">New Password</Label>
                  <Input 
                    id="new_password" 
                    name="new_password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-slate-700">Confirm Password</Label>
                  <Input 
                    id="confirm_password" 
                    name="confirm_password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Retype your new password"
                    className="bg-white"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-50 pt-6">
                <Button type="submit" variant="secondary">Change Password</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
