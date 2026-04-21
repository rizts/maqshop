export type Role = 'superadmin' | 'admin' | 'staff' | 'ortu'
export type Division = 'all' | 'banin' | 'banat'
export type Gender = 'male' | 'female'
export type SantriStatus = 'active' | 'alumni' | 'keluar'
export type OrgStatus = 'active' | 'suspended' | 'trial'
export type TopupRequestStatus = 'pending' | 'approved' | 'rejected'
export type TipeTransaksi =
  | 'deposit_cash'
  | 'deposit_transfer'
  | 'withdrawal'
  | 'pos_deduct'
  | 'adjustment'
export type PosStatus = 'success' | 'void'
export type StokLogType = 'masuk' | 'keluar' | 'koreksi'
export type CoaType = 'revenue' | 'cogs' | 'expense' | 'asset' | 'liability' | 'equity'
export type JurnalRefType = 'pos_transaksi' | 'topup' | 'withdrawal' | 'manual'
export type WithdrawalInterval = 'daily' | 'weekly' | 'monthly'

export interface OrgSettings {
  withdrawal_limit_enabled: boolean
  withdrawal_limit_amount: number
  withdrawal_limit_interval: WithdrawalInterval
  low_balance_threshold: number
  allow_negative_balance: boolean
  currency: string
  email_notifications: {
    deposit_approved: boolean
    deposit_rejected: boolean
    withdrawal: boolean
    low_balance: boolean
    pos_transaction: boolean
  }
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  address: string | null
  status: OrgStatus
  settings: OrgSettings
  created_at: string
}

export interface Profile {
  id: string
  org_id: string | null
  full_name: string
  role: Role
  division: Division
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface Santri {
  id: string
  org_id: string
  nis: string | null
  full_name: string
  gender: Gender
  kelas: string | null
  kamar: string | null
  tahun_masuk: number | null
  status: SantriStatus
  notes: string | null
  created_at: string
}

export interface GuardianSantri {
  id: string
  org_id: string
  guardian_id: string
  santri_id: string
  relationship: string | null
  created_at: string
  guardian?: Profile
  santri?: Santri
}

export interface Tabungan {
  id: string
  org_id: string
  santri_id: string
  saldo: number
  total_deposit: number
  total_keluar: number
  created_at: string
  updated_at: string
  santri?: Santri
}

export interface TransaksiTabungan {
  id: string
  org_id: string
  santri_id: string
  tipe: TipeTransaksi
  jumlah: number
  saldo_sebelum: number
  saldo_sesudah: number
  keterangan: string | null
  ref_topup_id: string | null
  ref_pos_id: string | null
  dibuat_oleh: string | null
  created_at: string
  santri?: Santri
  creator?: Profile
}

export interface TopupRequest {
  id: string
  org_id: string
  santri_id: string
  pengaju_id: string
  jumlah: number
  bukti_url: string | null
  catatan: string | null
  status: TopupRequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  santri?: Santri
  pengaju?: Profile
  reviewer?: Profile
}

export interface KategoriProduk {
  id: string
  org_id: string
  nama: string
  urutan: number
  aktif: boolean
}

export interface Produk {
  id: string
  org_id: string
  kategori_id: string | null
  kode: string | null
  nama: string
  deskripsi: string | null
  harga_beli: number
  harga_jual: number
  stok: number
  satuan: string
  gambar_url: string | null
  aktif: boolean
  created_at: string
  kategori?: KategoriProduk
}

export interface StokLog {
  id: string
  org_id: string
  produk_id: string
  tipe: StokLogType
  qty: number
  stok_sebelum: number
  stok_sesudah: number
  keterangan: string | null
  ref_id: string | null
  dibuat_oleh: string | null
  created_at: string
  produk?: Produk
}

export interface PosTransaksi {
  id: string
  org_id: string
  nomor: string
  santri_id: string
  total: number
  metode_bayar: string
  status: PosStatus
  kasir_id: string
  void_reason: string | null
  voided_at: string | null
  created_at: string
  santri?: Santri
  kasir?: Profile
  detail?: PosTransaksiDetail[]
}

export interface PosTransaksiDetail {
  id: string
  pos_transaksi_id: string
  produk_id: string
  nama_produk: string
  harga_beli: number
  harga_jual: number
  qty: number
  subtotal: number
}

export interface ChartOfAccount {
  id: string
  org_id: string
  kode: string
  nama: string
  tipe: CoaType
  parent_id: string | null
  is_system: boolean
  urutan: number
  aktif: boolean
  children?: ChartOfAccount[]
}

export interface Jurnal {
  id: string
  org_id: string
  tanggal: string
  nomor: string
  keterangan: string
  ref_id: string | null
  ref_type: JurnalRefType | null
  dibuat_oleh: string | null
  created_at: string
  detail?: JurnalDetail[]
}

export interface JurnalDetail {
  id: string
  jurnal_id: string
  coa_id: string
  debet: number
  kredit: number
  coa?: ChartOfAccount
}

// Cart item for POS
export interface CartItem {
  produk: Produk
  qty: number
  subtotal: number
}

// Database type placeholder - will be generated from Supabase
export type Database = Record<string, unknown>
