import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export default function PlatformLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200 transition-transform group-hover:scale-110">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
                Deposantri
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] -mt-1">
                Digital Ecosystem
              </span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-8">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Masuk
            </Link>
            <Button asChild className="rounded-xl px-6 font-bold shadow-lg shadow-emerald-100 transition-all hover:scale-105 active:scale-95">
              <Link href="/get-started">Daftar Pondok</Link>
            </Button>
          </nav>
        </div>
        {/* Subtle shadow gradient for smooth transition */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-50" />
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center px-4">
            <h1 className="font-sans text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Platform Keuangan Pesantren <span className="text-primary">Terpadu</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Sistem manajemen tabungan santri, Point of Sales Maqshof (Koperasi),
              dan laporan keuangan khusus untuk pondok pesantren dalam satu aplikasi pintar.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/get-started">Daftarkan Pondok</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto space-y-6 bg-slate-50 py-8 md:py-12 lg:py-24 px-4 rounded-xl">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Fitur Lengkap
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Semua yang Anda butuhkan untuk digitalisasi keuangan pondok pesantren
            </p>
          </div>
          
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Tabungan Santri</h3>
                  <p className="text-sm text-muted-foreground">Digitalisasi tabungan dengan limit penarikan harian.</p>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">POS Maqshof</h3>
                  <p className="text-sm text-muted-foreground">Kasir terintegrasi yang otomatis memotong saldo santri.</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Akses Wali Santri</h3>
                  <p className="text-sm text-muted-foreground">Pantau riwayat jajan anak dan top-up saldo via transfer.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for modern Islamic boarding schools. © {new Date().getFullYear()} Deposantri.
          </p>
        </div>
      </footer>
    </div>
  )
}
