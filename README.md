# Maqshop — Platform Manajemen Keuangan Pondok Pesantren

Maqshop adalah aplikasi finansial terpadu berbasis **multi-tenant** yang dirancang khusus untuk kebutuhan pondok pesantren. Aplikasi ini mengintegrasikan sistem tabungan santri, Point of Sales (POS) Maqshof (koperasi), dan laporan akuntansi otomatis.

## Fitur Utama

- **Multi-tenancy:** Satu database mendukung banyak pondok pesantren dengan isolasi data yang aman menggunakan Supabase Row Level Security (RLS).
- **Tabungan Santri:** Modul deposit, penarikan dana, dan mutasi saldo yang transparan.
- **POS Maqshof (Koperasi):** Sistem kasir terintegrasi yang memotong saldo tabungan santri secara real-time.
- **Double-Entry Accounting:** Auto-jurnal otomatis untuk setiap transaksi (Tabungan & POS) ke dalam Chart of Accounts (COA).
- **Dashboard Wali Santri:** Memungkinkan orang tua memantau saldo dan riwayat belanja anak serta mengirim uang saku via top-up request.
- **Role Based Access Control:**
  - **Superadmin:** Manajemen tenant/organisasi platform.
  - **Admin Pondok:** Pengaturan sistem, limit penarikan, dan manajemen user.
  - **Staff Maqshof:** Petugas kasir dan administrasi tabungan.
  - **Wali Santri:** Pengecekan saldo dan riwayat transaksi anak.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Accounting Logic:** Custom double-entry journal system.

## Persiapan Instalasi

1. **Clone repositori:**
   ```bash
   git clone <repo-url>
   cd Maqshop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin `.env.local.example` menjadi `.env.local` dan isi dengan kredensial Supabase Anda:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Setup Database Supabase:**
   - Jalankan migration SQL yang tersedia di folder `supabase/migrations/` secara berurutan.
   - Aktifkan trigger seeding COA dari `supabase/seed/default_coa.sql`.

5. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```

## Struktur Proyek

- `app/`: Folder utama Next.js 15 App Router.
  - `(auth)/`: Rute untuk login dan autentikasi.
  - `(dashboard)/`: Rute untuk admin, staff, dan ortu.
  - `(superadmin)/`: Dashboard manajemen platform.
  - `(public)/`: Landing page platform dan registrasi tenant.
- `components/`: UI components (shadcn/ui).
- `lib/`: Utilities, Supabase clients, dan Zustand stores.
- `types/`: Definisi tipe data TypeScript.
