import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Mail, Phone, MapPin, ExternalLink, GraduationCap } from 'lucide-react'

export default async function PlatformLandingPage() {
  const supabase = await createClient()
  const { data: organizations } = await (supabase
    .from('organizations') as any)
    .select('name, slug, logo_url, address')
    .eq('status', 'active')
    .order('name')
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto flex h-20 items-center px-6 lg:px-8">
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200 transition-transform group-hover:scale-110">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
                  Maqshop
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] -mt-1">
                  Ekosistem Digital
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 flex-initial justify-center px-4">
            <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Fitur
            </Link>
            <Link href="#network" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Jaringan
            </Link>
            <Link href="#contact" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Kontak
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors mr-2">
              Masuk
            </Link>
            <Button asChild className="rounded-xl px-6 font-bold shadow-lg shadow-emerald-100 transition-all hover:scale-105 active:scale-95">
              <Link href="/get-started">Daftar Pondok</Link>
            </Button>
          </div>
        </div>
        {/* Subtle shadow gradient for smooth transition */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-50" />
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden space-y-6 pb-20 pt-16 md:pb-28 md:pt-24 lg:py-36">
          {/* Background decoration elements */}
          <div className="absolute top-0 right-0 -z-10 translate-x-1/4 -translate-y-1/4">
            <div className="h-96 w-96 rounded-full bg-emerald-50 blur-3xl opacity-60" />
          </div>
          
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-6 text-center px-6 lg:px-8">
            <div className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-600/10 mb-2 animate-fade-in">
              ✨ Solusi Digital Pesantren Masa Kini
            </div>
            <h1 className="font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.1]">
              Platform Keuangan Pesantren <span className="text-emerald-600">Terpadu</span>
            </h1>
            <p className="max-w-[42rem] leading-relaxed text-slate-500 sm:text-xl sm:leading-9">
              Sistem manajemen tabungan santri, Point of Sales Maqshof (Koperasi),
              dan laporan keuangan khusus untuk pondok pesantren dalam satu aplikasi pintar yang aman dan transparan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
              <Button size="lg" asChild className="h-14 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-emerald-200 transition-all hover:scale-[1.03]">
                <Link href="/get-started">Daftarkan Pondok Sekarang</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-bold rounded-2xl border-slate-200 hover:bg-slate-50 transition-all">
                <Link href="#features">Pelajari Fitur</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Jaringan Maqshop Section */}
        {organizations && organizations.length > 0 && (
          <section id="network" className="bg-slate-50/50 py-20 md:py-28 scroll-mt-20">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Jaringan Maqshop
                </div>
                <h2 className="text-3xl font-black text-slate-900 sm:text-4xl md:text-5xl tracking-tight">
                  Pondok Pesantren
                </h2>
                <div className="h-1.5 w-20 bg-emerald-600 rounded-full" />
                <p className="max-w-2xl text-slate-500 text-lg">
                  Bergabunglah dengan ekosistem digital bersama pondok pesantren lainnya yang telah mempercayakan manajemen keuangannya pada Maqshop.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {organizations.map((org: any) => (
                  <Link 
                    key={org.slug} 
                    href={`/${org.slug}`}
                    className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1.5 flex flex-col items-center text-center overflow-hidden w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(25%-1.5rem)] max-w-sm"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4 text-emerald-500" />
                    </div>
                    
                    <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="h-12 w-12 object-contain" />
                      ) : (
                        <GraduationCap className="h-10 w-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-1">
                      {org.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 italic">
                      {org.address || 'Portal Resmi Pondok Pesantren'}
                    </p>
                    
                    <div className="mt-6 w-full pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      Buka Portal <ExternalLink className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="features" className="container mx-auto space-y-12 py-20 md:py-28 lg:py-32 px-6 lg:px-8 scroll-mt-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-black text-3xl leading-[1.1] sm:text-4xl md:text-5xl text-slate-900">
              Fitur Utama
            </h2>
            <div className="h-1.5 w-20 bg-emerald-600 rounded-full" />
            <p className="max-w-[85%] leading-relaxed text-slate-500 sm:text-lg">
              Instrumen lengkap untuk mendigitalisasi seluruh aspek ekonomi di lingkungan pesantren.
            </p>
          </div>
          
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {[
              { 
                title: "Tabungan Santri", 
                desc: "Digitalisasi tabungan dengan limit penarikan harian, mutasi otomatis, dan keamanan tingkat tinggi.",
                bg: "bg-blue-50",
                icon: "💰"
              },
              { 
                title: "POS Maqshof", 
                desc: "Kasir terintegrasi untuk koperasi/kantin yang otomatis memotong saldo tabungan santri via kartu/ID.",
                bg: "bg-emerald-50",
                icon: "🛒"
              },
              { 
                title: "Akses Wali Santri", 
                desc: "Pantau riwayat jajan anak secara real-time, beri limit jajan, dan top-up saldo via transfer mudah.",
                bg: "bg-amber-50",
                icon: "👨‍👩‍👧"
              }
            ].map((f, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-emerald-100 hover:-translate-y-1">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${f.bg} text-3xl`}>
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-slate-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="bg-slate-900 py-24 md:py-32 scroll-mt-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">Butuh Bantuan?</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Tim developer kami siap membantu Anda 24/7 untuk memastikan implementasi digitalisasi pondok berjalan lancar.
                  </p>
                </div>
                
                <div className="grid gap-6">
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-500">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Pusat Dukungan</p>
                      <p className="text-sm text-slate-400">
                        <a href="https://risdylabs.my.id" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">
                          Risdy Labs (risdylabs.my.id)
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                    <div className="h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Email & Obrolan</p>
                      <p className="text-sm text-slate-400">
                        <a href="mailto:rizts.tech@gmail.com" className="hover:text-emerald-500 transition-colors">rizts.tech@gmail.com</a>
                        {' | '}
                        <a href="https://wa.me/628562302121" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">WA: +62 856-2302-121</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-2 bg-emerald-600 w-full" />
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Kirim Pesan Cepat</h3>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="Nama Anda" className="h-12 rounded-xl border-slate-200 bg-slate-50" />
                    <Input placeholder="Pondok Pesantren" className="h-12 rounded-xl border-slate-200 bg-slate-50" />
                  </div>
                  <Input placeholder="Alamat Email" className="h-12 rounded-xl border-slate-200 bg-slate-50" />
                  <textarea placeholder="Pesan Anda..." className="w-full min-h-[120px] rounded-xl border-slate-200 bg-slate-50 p-4 text-sm focus:ring-emerald-600 focus:border-emerald-600 outline-none" />
                  <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100">Kirim Sekarang</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 pb-12 pt-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Maqshop</span>
              </Link>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                Membangun masa depan pesantren yang lebih mandiri dan transparan melalui teknologi digital yang mudah digunakan oleh seluruh santri dan pengelola.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#features" className="hover:text-emerald-600 transition-colors">Semua Fitur</Link></li>
                <li><Link href="/get-started" className="hover:text-emerald-600 transition-colors">Daftar Pondok</Link></li>
                <li><Link href="/login" className="hover:text-emerald-600 transition-colors">Login Admin</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/help" className="hover:text-emerald-600 transition-colors">Bantuan</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs text-center md:text-left">
              &copy; {new Date().getFullYear()} Maqshop. Dilindungi Hak Cipta. Dikembangkan oleh Tim Teknologi Islamic Ecosystem.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Instagram</Link>
              <Link href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Twitter</Link>
              <Link href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">YouTube</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
