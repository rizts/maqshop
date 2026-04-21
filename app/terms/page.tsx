import React from 'react'
import { MarketingLayout } from '@/components/layout/marketing-layout'
import { FileText, Shield, CheckCircle2 } from 'lucide-react'

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 md:text-4xl">Syarat dan Ketentuan</h1>
              <p className="text-slate-500">Terakhir diperbarui: 21 April 2026</p>
            </div>
          </div>

          <div className="prose prose-slate prose-emerald max-w-none space-y-12 text-slate-600 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan mengakses dan menggunakan platform Maqshop, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Maqshop menyediakan layanan manajemen keuangan digital khusus untuk ekosistem pondok pesantren.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">2. Pendaftaran dan Akun</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Lembaga (Pondok Pesantren) wajib memberikan data valid saat pendaftaran.</li>
                <li>Admin lembaga bertanggung jawab penuh atas keamanan kredensial akun dan aktivitas di bawah akun tersebut.</li>
                <li>Wali santri akan menerima akses setelah diverifikasi oleh pihak lembaga terkait.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">3. Layanan Keuangan (Tabungan & POS)</h2>
              <p>
                Platform Maqshop memfasilitasi pencatatan transaksi tabungan santri dan transaksi retail pada unit usaha pondok (Maqshof/Koperasi).
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Saldo yang tercatat merupakan representasi dari dana fisik yang dikelola oleh bendahara pondok.</li>
                <li>Penyelesaian sengketa transaksi keuangan dilakukan secara internal antara wali santri dan pihak pondok pesantren.</li>
                <li>Maqshop tidak bertanggung jawab atas kesalahan input data manual yang dilakukan oleh staf lembaga.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">4. Tanggung Jawab Pengguna</h2>
              <p>
                Pengguna dilarang menggunakan Maqshop untuk kegiatan yang melanggar hukum, penipuan, atau aktivitas yang dapat merusak integritas sistem Maqshop.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">5. Perubahan Ketentuan</h2>
              <p>
                Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.
              </p>
            </section>
          </div>

          <div className="mt-16 p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900">Pertanyaan Hukum?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi tim legal kami melalui <strong>legal@maqshop.id</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
