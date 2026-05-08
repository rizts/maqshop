import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, X, FileImage, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { reviewTopupRequest } from './actions'

export default async function TopupRequestsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Find org id
  const { data: org } = await (supabase.from('organizations') as any).select('id').eq('slug', orgSlug).single()

  // Fetch pending requests
  const { data: requests } = await (supabase
    .from('topup_requests') as any)
    .select(`
      *,
      santri (id, full_name, nis, gender),
      pengaju:profiles!pengaju_id (full_name, role)
    `)
    .eq('org_id', org?.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${orgSlug}/tabungan`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Top-up Requests</h1>
          <p className="text-muted-foreground">Persetujuan transfer masuk dari wali santri.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {requests?.length === 0 ? (
          <Card>
            <CardContent className="flex justify-center items-center h-[200px] text-muted-foreground">
              Tidak ada pengajuan top-up yang menunggu persetujuan.
            </CardContent>
          </Card>
        ) : (
          requests?.map((req: any) => (
            <Card key={req.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 bg-slate-50 border-r p-6 flex flex-col items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <FileImage className="h-5 w-5" />
                    <span className="font-medium">Bukti Transfer</span>
                  </div>
                  {/* Since MVP uses placeholder url: */}
                  <div className="w-full h-48 bg-white border rounded-md overflow-hidden flex items-center justify-center relative">
                    {req.bukti_url?.toLowerCase().endsWith('.pdf') ? (
                      <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <FileText className="h-12 w-12 text-red-500" />
                        <span className="text-xs font-medium text-muted-foreground break-all">
                          Lihat PDF di Tab Baru
                        </span>
                      </div>
                    ) : (
                      <img 
                        src={req.bukti_url || '/placeholder.jpg'} 
                        alt="Bukti Transfer" 
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                  <Button variant="link" size="sm" asChild>
                    <a href={req.bukti_url} target="_blank" rel="noreferrer">Lihat Gambar Penuh &nearr;</a>
                  </Button>
                </div>
                <div className="w-full md:w-2/3 p-6 flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{req.santri.full_name} <span className="text-muted-foreground text-sm font-normal">({req.santri.nis})</span></h3>
                        <p className="text-sm text-muted-foreground">Pengaju: {req.pengaju.full_name} ({req.pengaju.role})</p>
                        <p className="text-sm text-muted-foreground">Waktu: {format(new Date(req.created_at), 'dd MMM yyyy, HH:mm')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Nominal Top-up</div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(req.jumlah)}</div>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md mb-6">
                      <p className="text-sm font-medium mb-1">Catatan Pengaju:</p>
                      <p className="text-sm text-muted-foreground italic">{req.catatan || 'Tidak ada catatan'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-end border-t pt-4">
                    <form action={reviewTopupRequest}>
                      <input type="hidden" name="orgSlug" value={orgSlug} />
                      <input type="hidden" name="orgId" value={org?.id} />
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="action" value="reject" />
                      <Button variant="destructive" type="submit">
                        <X className="mr-2 h-4 w-4" /> Tolak
                      </Button>
                    </form>
                    
                    <form action={reviewTopupRequest}>
                      <input type="hidden" name="orgSlug" value={orgSlug} />
                      <input type="hidden" name="orgId" value={org?.id} />
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="action" value="approve" />
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" /> Setujui & Tambah Saldo
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
