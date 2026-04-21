import React from 'react'
import { MarketingLayout } from '@/components/layout/marketing-layout'
import { HelpCircle, Search, CreditCard, Users, ShoppingBag, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HelpPage() {
  const faqs = [
    {
      category: "Pendaftaran",
      icon: <Users className="h-5 w-5" />,
      questions: [
        {
          q: "Bagaimana cara mendaftarkan pondok di Maqshop?",
          a: "Klik tombol 'Daftar Pondok' di halaman utama, isi data lembaga Anda, dan tim kami akan melakukan verifikasi sebelum Anda dapat mulai menggunakan layanan."
        },
        {
          q: "Siapa saja yang bisa mengakses dashboard admin?",
          a: "Pemilik akun (Super Admin) dapat mengundang staf pengelola lain dengan peran 'Admin Pondok' atau 'Pengelola' melalui menu Manajemen Pengguna."
        }
      ]
    },
    {
      category: "Tabungan & Santri",
      icon: <CreditCard className="h-5 w-5" />,
      questions: [
        {
          q: "Bagaimana cara menambahkan data santri?",
          a: "Setelah login, buka menu 'Data Santri' dan klik 'Tambah Santri'. Anda bisa mengisi data manual atau melakukan import massal."
        },
        {
          q: "Bagaimana sistem top-up saldo tabungan?",
          a: "Wali santri dapat mengirim permintaan top-up melalui portal mereka. Bendahara pondok akan menerima notifikasi dan melakukan validasi saldo setelah dana fisik diterima."
        }
      ]
    },
    {
      category: "POS Maqshof (Koperasi)",
      icon: <ShoppingBag className="h-5 w-5" />,
      questions: [
        {
          q: "Bagaimana cara santri jajan di kantin/maqshof?",
          a: "Santri cukup menyebutkan nama atau scan kartu identitas mereka pada aplikasi POS Maqshof. Saldo tabungan mereka akan terpotong otomatis sesuai belanjaan."
        },
        {
          q: "Dapatkah wali santri membatasi uang jajan anak?",
          a: "Ya, wali santri dapat mengatur limit jajan harian melalui portal khusus wali santri agar pengeluaran anak tetap terkontrol."
        }
      ]
    }
  ]

  return (
    <MarketingLayout>
      <div className="bg-slate-900 py-16 md:py-24 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center max-w-3xl">
          <HelpCircle className="h-12 w-12 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-4">Pusat Bantuan Maqshop</h1>
          <p className="text-slate-400 text-lg mb-8">Cari panduan dan jawaban untuk mempermudah operasional digital pesantren Anda.</p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Cari bantuan (misal: cara top-up)..." 
              className="h-14 pl-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <div className="grid gap-16">
            {faqs.map((group, i) => (
              <div key={i} className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    {group.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{group.category}</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {group.questions.map((faq, j) => (
                    <div key={j} className="space-y-3">
                      <h3 className="font-bold text-slate-900 text-lg">Q: {faq.q}</h3>
                      <p className="text-slate-600 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 p-10 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />
            <h3 className="text-2xl font-bold text-white mb-4">Masih Butuh Bantuan Lain?</h3>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">Tim kami siap memandu proses digitalisasi pondok Anda melalui sesi demonstrasi atau bantuan langsung via WhatsApp.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="rounded-2xl h-14 px-8 font-bold bg-emerald-600 hover:bg-emerald-700">
                <Link href="/#contact">Hubungi Kami</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
