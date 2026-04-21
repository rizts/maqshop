'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Plus, Minus, Trash2, ArrowLeft, Search, UserCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useCartStore } from '@/lib/stores/cart.store'
import { processCheckout } from './actions'

export default function KasirPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const { organization } = useAuthStore()
  const cart = useCartStore()
  const supabase = createClient()

  const [products, setProducts] = useState<any[]>([])
  const [searchProd, setSearchProd] = useState('')
  const [santriList, setSantriList] = useState<any[]>([])
  const [selectedSantriId, setSelectedSantriId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  useEffect(() => {
    if (organization?.id) {
       // Fetch active products
       supabase.from('produk')
        .select('*')
        .eq('org_id', organization.id)
        .eq('aktif', true)
        .order('nama')
        .then(({data}) => { if(data) setProducts(data) })

       // Fetch active santri
       supabase.from('santri')
        .select('id, full_name, nis, tabungan(saldo)')
        .eq('org_id', organization.id)
        .eq('status', 'active')
        .order('full_name')
        .then(({data}) => { if(data) setSantriList(data) })
    }
  }, [organization, supabase])

  const filteredProducts = products.filter(p => p.nama.toLowerCase().includes(searchProd.toLowerCase()))
  const selectedSantri = santriList.find(s => s.id === selectedSantriId)

  const handleCheckout = async () => {
    if (!selectedSantri) {
       toast.error('Silakan pilih santri pembeli terlebih dahulu')
       return
    }
    if (cart.items.length === 0) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('orgSlug', orgSlug)
    formData.append('orgId', organization!.id!)
    formData.append('santriId', selectedSantri.id)
    formData.append('cart', JSON.stringify(cart.items))

    try {
      await processCheckout(formData)
      toast.success('Transaksi berhasil!')
      cart.clearCart()
      setSelectedSantriId('')
      setCheckoutSuccess(true)
      
      // Reset success message after 3 seconds
      setTimeout(() => setCheckoutSuccess(false), 3000)
    } catch (error: any) {
      toast.error(error.message || 'Transaksi gagal diproses')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Kiri: Katalog Produk */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-slate-50 flex items-center gap-4">
           <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href={`/${orgSlug}/maqshof`}><ArrowLeft className="h-5 w-5"/></Link>
           </Button>
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Cari produk kasir..." 
               className="pl-9 bg-white" 
               value={searchProd}
               onChange={(e) => setSearchProd(e.target.value)}
             />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <Card 
                key={p.id} 
                className={`cursor-pointer transition-colors hover:border-primary active:bg-slate-50 ${cart.items.find(i => i.id === p.id) ? 'border-primary ring-1 ring-primary' : ''}`}
                onClick={() => cart.addItem({ id: p.id, nama: p.nama, harga: p.harga_jual, minStok: p.stok })}
              >
                <CardContent className="p-4 text-center aspect-[4/3] flex flex-col justify-center">
                   <div className="font-semibold line-clamp-2 leading-tight mb-2">{p.nama}</div>
                   <div className="text-primary font-bold text-lg">{formatCurrency(p.harga_jual)}</div>
                   {p.stok <= 5 && (
                      <div className="text-[10px] text-orange-500 font-medium tracking-wider mt-1">Sisa Stok: {p.stok}</div>
                   )}
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">Produk tidak ditemukan</div>
            )}
          </div>
        </div>
      </div>

      {/* Kanan: Keranjang (Cart) */}
      <div className="w-[380px] shrink-0 flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-slate-900 text-slate-50 flex items-center justify-between">
           <h2 className="font-semibold text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5"/> Keranjang</h2>
           <Button variant="ghost" className="h-8 text-slate-300 hover:text-white" onClick={() => cart.clearCart()}>Bersihkan</Button>
        </div>

        <div className="p-4 border-b bg-slate-50 space-y-3">
           <div className="flex items-center gap-2 text-sm font-medium">
             <UserCheck className="h-4 w-4 text-primary" /> Pembeli (Tarik Saldo)
           </div>
           <select 
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
           >
              <option value="" disabled>-- Pilih santri / scan barcode --</option>
              {santriList?.map(s => (
                 <option key={s.id} value={s.id}>{s.nis ? `[${s.nis}] ` : ''}{s.full_name}</option>
              ))}
           </select>
           {selectedSantri && (
              <div className="flex justify-between text-sm py-1 px-2 rounded-md bg-green-50 text-green-800 border border-green-200">
                <span>Saldo Santri:</span>
                <span className="font-bold">{formatCurrency(selectedSantri.tabungan?.saldo || 0)}</span>
              </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-2">
           {cart.items.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                 <ShoppingCart className="h-12 w-12 text-slate-200" />
                 <p>Keranjang kosong</p>
             </div>
           ) : (
             <ul className="space-y-2">
               {cart.items.map(item => (
                 <li key={item.id} className="bg-white p-3 rounded-lg border shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between font-medium">
                      <span className="line-clamp-1">{item.nama}</span>
                      <span>{formatCurrency(item.harga * item.qty)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground text-sm border-t pt-2">
                      <span>{formatCurrency(item.harga)}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => item.qty === 1 ? cart.removeItem(item.id) : cart.updateQuantity(item.id, item.qty - 1)} className="rounded-full bg-slate-100 p-1 hover:bg-slate-200"><Minus className="h-4 w-4"/></button>
                        <span className="w-4 text-center font-semibold text-slate-900">{item.qty}</span>
                        <button onClick={() => cart.updateQuantity(item.id, item.qty + 1)} className="rounded-full bg-slate-100 p-1 hover:bg-slate-200"><Plus className="h-4 w-4"/></button>
                      </div>
                    </div>
                 </li>
               ))}
             </ul>
           )}
        </div>

        <div className="p-4 border-t bg-white space-y-4">
           {checkoutSuccess && (
             <div className="bg-green-100 text-green-800 p-2 text-center rounded text-sm font-medium animate-pulse">
               ✔ Transaksi Berhasil
             </div>
           )}
           <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-muted-foreground">Total</span>
              <span className="font-bold text-2xl text-primary">{formatCurrency(cart.total)}</span>
           </div>
           <Button 
             className="w-full h-14 text-lg" 
             size="lg" 
             disabled={cart.items.length === 0 || !selectedSantri || isLoading}
             onClick={handleCheckout}
           >
             {isLoading ? 'Memproses...' : 'BAYAR (Potong Saldo)'}
           </Button>
        </div>
      </div>
    </div>
  )
}
