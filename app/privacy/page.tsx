import React from 'react'
import { MarketingLayout } from '@/components/layout/marketing-layout'
import { ShieldCheck, Eye, Lock, Database } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 md:text-4xl">Kebijakan Privasi</h1>
              <p className="text-slate-500">Terakhir diperbarui: 21 April 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed">
            <p className="text-lg">
              Privasi Anda dan data santri adalah prioritas utama kami. Kebijakan Privasi ini menjelaskan bagaimana Maqshop mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda dalam ekosistem digital kami.
            </p>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-500" /> Informasi yang Kami Kumpulkan
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Data Lembaga & Pengelola</h3>
                  <p className="text-sm">Nama pondok, alamat, email, nomor telepon, dan data identitas admin pengelola.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Data Santri & Wali</h3>
                  <p className="text-sm">Nama lengkap santri, NIS, NISN, gender, kelas, kamar, serta data kontak wali santri.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Data Transaksi</h3>
                  <p className="text-sm">Riwayat tabungan, setoran, penarikan, dan belanja di Maqshof untuk keperluan pelaporan.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Data Penggunaan</h3>
                  <p className="text-sm">Alamat IP, informasi perangkat, dan log aktivitas untuk keamanan sistem.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-500" /> Penggunaan Informasi
              </h2>
              <p>Kami menggunakan data yang dikumpulkan untuk:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Menyediakan layanan manajemen keuangan pesantren yang akurat.</li>
                <li>Memfasilitasi komunikasi antara pengelola pondok dan wali santri.</li>
                <li>Meningkatkan keamanan dan memverifikasi identitas pengguna.</li>
                <li>Melakukan pemeliharaan sistem dan pengembangan fitur baru.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Lock className="h-5 w-5 text-blue-500" /> Keamanan Data
              </h2>
              <p>
                Maqshop menggunakan teknologi enkripsi industri (SSL/TLS) dan infrastruktur database yang aman untuk melindungi data Anda. Data disimpan di server yang memiliki standar keamanan tinggi dan hanya dapat diakses oleh personil yang berwenang.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Pembagian Data</h2>
              <p>
                Maqshop tidak akan menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga untuk kepentingan pemasaran. Data hanya akan dibagikan kepada pihak berwenang jika diwajibkan oleh hukum yang berlaku di Indonesia.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Hak Anda</h2>
              <p>
                Anda memiliki hak untuk mengakses, memperbarui, atau meminta penghapusan data pribadi Anda yang tersimpan di sistem kami melalui pengelola lembaga Anda masing-masing.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
