-- ============================================================
-- PLATFORM LEVEL
-- ============================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TENANT / ORGANIZATION
-- ============================================================

CREATE TABLE public.organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,           -- URL identifier
  logo_url    TEXT,
  address     TEXT,
  status      TEXT DEFAULT 'active',          -- active | suspended | trial
  settings    JSONB DEFAULT '{
    "withdrawal_limit_enabled": true,
    "withdrawal_limit_amount": 50000,
    "withdrawal_limit_interval": "daily",     -- daily | weekly | monthly
    "low_balance_threshold": 10000,
    "allow_negative_balance": false,
    "currency": "IDR",
    "email_notifications": {
      "deposit_approved": true,
      "deposit_rejected": true,
      "withdrawal": true,
      "low_balance": true,
      "pos_transaction": false
    }
  }',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER PROFILES
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID REFERENCES public.organizations(id),   -- NULL = superadmin platform
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL,     -- superadmin | admin | staff | ortu
  division    TEXT DEFAULT 'all', -- all | banin | banat  (berlaku untuk admin & staff)
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SANTRI
-- ============================================================

CREATE TABLE public.santri (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id),
  nis         TEXT,                            -- Nomor Induk Santri
  full_name   TEXT NOT NULL,
  gender      TEXT NOT NULL,                  -- male (banin) | female (banat)
  kelas       TEXT,
  kamar       TEXT,
  tahun_masuk INT,
  status      TEXT DEFAULT 'active',          -- active | alumni | keluar
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Relasi ortu ↔ santri (many-to-many)
CREATE TABLE public.guardian_santri (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id),
  guardian_id   UUID NOT NULL REFERENCES public.profiles(id),
  santri_id     UUID NOT NULL REFERENCES public.santri(id),
  relationship  TEXT,   -- ayah | ibu | wali
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_id, santri_id)
);

-- ============================================================
-- TABUNGAN
-- ============================================================

CREATE TABLE public.tabungan (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id),
  santri_id     UUID NOT NULL REFERENCES public.santri(id) UNIQUE,
  saldo         NUMERIC(15,2) DEFAULT 0,
  total_deposit NUMERIC(15,2) DEFAULT 0,   -- akumulasi semua deposit
  total_keluar  NUMERIC(15,2) DEFAULT 0,   -- akumulasi semua pengeluaran
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TRANSAKSI TABUNGAN
-- ============================================================

-- Pengajuan Top-up (dari ortu atau staff)
CREATE TABLE public.topup_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id),
  santri_id       UUID NOT NULL REFERENCES public.santri(id),
  pengaju_id      UUID NOT NULL REFERENCES public.profiles(id),  -- ortu atau staff
  jumlah          NUMERIC(15,2) NOT NULL,
  bukti_url       TEXT,                       -- URL file bukti transfer (Storage)
  catatan         TEXT,
  status          TEXT DEFAULT 'pending',     -- pending | approved | rejected
  reviewed_by     UUID REFERENCES public.profiles(id),
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Riwayat transaksi tabungan
CREATE TABLE public.transaksi_tabungan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id),
  santri_id       UUID NOT NULL REFERENCES public.santri(id),
  tipe            TEXT NOT NULL,
    -- deposit_cash       = deposit langsung oleh admin
    -- deposit_transfer   = top-up via transfer (diajukan ortu/staff)
    -- withdrawal         = penarikan untuk keperluan luar maqshof
    -- pos_deduct         = pemotongan dari transaksi POS
    -- adjustment         = koreksi oleh admin
  jumlah          NUMERIC(15,2) NOT NULL,
  saldo_sebelum   NUMERIC(15,2) NOT NULL,
  saldo_sesudah   NUMERIC(15,2) NOT NULL,
  keterangan      TEXT,                        -- WAJIB untuk withdrawal & adjustment
  ref_topup_id    UUID REFERENCES public.topup_requests(id),
  ref_pos_id      UUID,                        -- FK di set nanti ke pos_transaksi
  dibuat_oleh     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PRODUK & KATEGORI (MAQSHOF)
-- ============================================================

CREATE TABLE public.kategori_produk (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID NOT NULL REFERENCES public.organizations(id),
  nama      TEXT NOT NULL,
  urutan    INT DEFAULT 0,
  aktif     BOOLEAN DEFAULT true
);

CREATE TABLE public.produk (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id),
  kategori_id   UUID REFERENCES public.kategori_produk(id),
  kode          TEXT,
  nama          TEXT NOT NULL,
  deskripsi     TEXT,
  harga_beli    NUMERIC(15,2) DEFAULT 0,
  harga_jual    NUMERIC(15,2) NOT NULL,
  stok          INT DEFAULT 0,
  satuan        TEXT DEFAULT 'pcs',
  gambar_url    TEXT,
  aktif         BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POS TRANSAKSI
-- ============================================================

CREATE TABLE public.pos_transaksi (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id),
  nomor         TEXT NOT NULL,               -- auto-generated invoice number
  santri_id     UUID NOT NULL REFERENCES public.santri(id),
  total         NUMERIC(15,2) NOT NULL,
  metode_bayar  TEXT DEFAULT 'saldo',        -- saldo (dari tabungan)
  status        TEXT DEFAULT 'success',      -- success | void
  kasir_id      UUID NOT NULL REFERENCES public.profiles(id),
  void_reason   TEXT,
  voided_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint that was delayed
ALTER TABLE public.transaksi_tabungan
ADD CONSTRAINT fk_pos_transaksi 
FOREIGN KEY (ref_pos_id) REFERENCES public.pos_transaksi(id);

CREATE TABLE public.pos_transaksi_detail (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_transaksi_id UUID NOT NULL REFERENCES public.pos_transaksi(id) ON DELETE CASCADE,
  produk_id       UUID NOT NULL REFERENCES public.produk(id),
  nama_produk     TEXT NOT NULL,             -- snapshot nama saat transaksi
  harga_beli      NUMERIC(15,2) NOT NULL,    -- snapshot untuk laporan L/R
  harga_jual      NUMERIC(15,2) NOT NULL,
  qty             INT NOT NULL,
  subtotal        NUMERIC(15,2) NOT NULL
);

-- Log pergerakan stok
CREATE TABLE public.stok_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id),
  produk_id   UUID NOT NULL REFERENCES public.produk(id),
  tipe        TEXT NOT NULL,   -- masuk | keluar | koreksi
  qty         INT NOT NULL,
  stok_sebelum INT NOT NULL,
  stok_sesudah INT NOT NULL,
  keterangan  TEXT,
  ref_id      UUID,            -- ref ke pos_transaksi atau manual
  dibuat_oleh UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AKUNTANSI (CHART OF ACCOUNTS & JURNAL)
-- ============================================================

CREATE TABLE public.chart_of_accounts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID NOT NULL REFERENCES public.organizations(id),
  kode      TEXT NOT NULL,
  nama      TEXT NOT NULL,
  tipe      TEXT NOT NULL,   -- revenue | cogs | expense | asset | liability | equity
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  is_system BOOLEAN DEFAULT false,   -- COA default sistem, tidak bisa dihapus
  urutan    INT DEFAULT 0,
  aktif     BOOLEAN DEFAULT true
);

CREATE TABLE public.jurnal (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id),
  tanggal     DATE NOT NULL,
  nomor       TEXT NOT NULL,
  keterangan  TEXT NOT NULL,
  ref_id      UUID,
  ref_type    TEXT,    -- pos_transaksi | topup | withdrawal | manual
  dibuat_oleh UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.jurnal_detail (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurnal_id   UUID NOT NULL REFERENCES public.jurnal(id) ON DELETE CASCADE,
  coa_id      UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  debet       NUMERIC(15,2) DEFAULT 0,
  kredit      NUMERIC(15,2) DEFAULT 0
);
