import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateTenantSettings } from './actions'
import type { OrgSettings } from '@/types'

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get current tenant settings
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single()

  if (!org) return <div>Org not found</div>
  
  const settings = org.settings as OrgSettings

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Lembaga</h1>
        <p className="text-muted-foreground">Kelola konfigurasi dan batasan lembaga Anda.</p>
      </div>

      <form action={updateTenantSettings}>
        <input type="hidden" name="orgId" value={org.id} />
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <input type="hidden" name="currentSettings" value={JSON.stringify(settings)} />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Pondok</CardTitle>
              <CardDescription>Informasi umum mengenai pondok pesantren.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lembaga</Label>
                <Input id="name" name="name" defaultValue={org.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" name="address" defaultValue={org.address || ''} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keuangan & Batas Penarikan</CardTitle>
              <CardDescription>Konfigurasi batasan dan ambang batas akun santri.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Aktifkan Batas Penarikan</Label>
                  <p className="text-sm text-muted-foreground">
                    Terapkan jumlah maksimum untuk penarikan.
                  </p>
                </div>
                {/* Note: since this is a native form submission, we use a hidden input for the switch or just a normal checkbox for simplicity in server actions. Let's use standard native inputs for simplicity in this baseline */}
                <input 
                  type="checkbox" 
                  name="withdrawal_limit_enabled" 
                  className="h-5 w-5"
                  defaultChecked={settings.withdrawal_limit_enabled} 
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal_limit_amount">Jumlah Batasan (Rp)</Label>
                  <Input 
                    id="withdrawal_limit_amount" 
                    name="withdrawal_limit_amount" 
                    type="number" 
                    min="0"
                    defaultValue={settings.withdrawal_limit_amount} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawal_limit_interval">Interval Batasan</Label>
                  <select 
                    id="withdrawal_limit_interval" 
                    name="withdrawal_limit_interval" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={settings.withdrawal_limit_interval}
                  >
                     <option value="daily">Harian</option>
                     <option value="weekly">Mingguan</option>
                     <option value="monthly">Bulanan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="low_balance_threshold">Ambang Batas Peringatan Saldo Rendah (Rp)</Label>
                <Input 
                  id="low_balance_threshold" 
                  name="low_balance_threshold" 
                  type="number" 
                  min="0"
                  defaultValue={settings.low_balance_threshold} 
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Izinkan Saldo Negatif</Label>
                  <p className="text-sm text-muted-foreground">
                    Izinkan saldo santri berada di bawah nol (hutang).
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  name="allow_negative_balance" 
                  className="h-5 w-5"
                  defaultChecked={settings.allow_negative_balance} 
                />
              </div>
            </CardContent>
            <CardFooter>
               <Button type="submit">Simpan Perubahan</Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
