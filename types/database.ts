import { 
  Role, 
  Division, 
  Gender, 
  SantriStatus, 
  OrgStatus, 
  TopupRequestStatus, 
  TipeTransaksi, 
  PosStatus, 
  StokLogType, 
  CoaType, 
  JurnalRefType 
} from './base'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          address: string | null
          status: OrgStatus
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          address?: string | null
          status?: OrgStatus
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          address?: string | null
          status?: OrgStatus
          settings?: Json
          created_at?: string
        }
      }
      profiles: {
        Row: {
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
        Insert: {
          id: string
          org_id?: string | null
          full_name: string
          role: Role
          division?: Division
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          full_name?: string
          role?: Role
          division?: Division
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      santri: {
        Row: {
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
        Insert: {
          id?: string
          org_id: string
          nis?: string | null
          full_name: string
          gender: Gender
          kelas?: string | null
          kamar?: string | null
          tahun_masuk?: number | null
          status?: SantriStatus
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          nis?: string | null
          full_name?: string
          gender?: Gender
          kelas?: string | null
          kamar?: string | null
          tahun_masuk?: number | null
          status?: SantriStatus
          notes?: string | null
          created_at?: string
        }
      }
      guardian_santri: {
        Row: {
          id: string
          org_id: string
          guardian_id: string
          santri_id: string
          relationship: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          guardian_id: string
          santri_id: string
          relationship?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          guardian_id?: string
          santri_id?: string
          relationship?: string | null
          created_at?: string
        }
      }
      tabungan: {
        Row: {
          id: string
          org_id: string
          santri_id: string
          saldo: number
          total_deposit: number
          total_keluar: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          santri_id: string
          saldo?: number
          total_deposit?: number
          total_keluar?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          santri_id?: string
          saldo?: number
          total_deposit?: number
          total_keluar?: number
          created_at?: string
          updated_at?: string
        }
      }
      topup_requests: {
        Row: {
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
        }
        Insert: {
          id?: string
          org_id: string
          santri_id: string
          pengaju_id: string
          jumlah: number
          bukti_url?: string | null
          catatan?: string | null
          status?: TopupRequestStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          santri_id?: string
          pengaju_id?: string
          jumlah?: number
          bukti_url?: string | null
          catatan?: string | null
          status?: TopupRequestStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
        }
      }
      transaksi_tabungan: {
        Row: {
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
        }
        Insert: {
          id?: string
          org_id: string
          santri_id: string
          tipe: TipeTransaksi
          jumlah: number
          saldo_sebelum: number
          saldo_sesudah: number
          keterangan?: string | null
          ref_topup_id?: string | null
          ref_pos_id?: string | null
          dibuat_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          santri_id?: string
          tipe?: TipeTransaksi
          jumlah?: number
          saldo_sebelum?: number
          saldo_sesudah?: number
          keterangan?: string | null
          ref_topup_id?: string | null
          ref_pos_id?: string | null
          dibuat_oleh?: string | null
          created_at?: string
        }
      }
      kategori_produk: {
        Row: {
          id: string
          org_id: string
          nama: string
          urutan: number
          aktif: boolean
        }
        Insert: {
          id?: string
          org_id: string
          nama: string
          urutan?: number
          aktif?: boolean
        }
        Update: {
          id?: string
          org_id?: string
          nama?: string
          urutan?: number
          aktif?: boolean
        }
      }
      produk: {
        Row: {
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
        }
        Insert: {
          id?: string
          org_id: string
          kategori_id?: string | null
          kode?: string | null
          nama: string
          deskripsi?: string | null
          harga_beli?: number
          harga_jual: number
          stok?: number
          satuan?: string
          gambar_url?: string | null
          aktif?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          kategori_id?: string | null
          kode?: string | null
          nama?: string
          deskripsi?: string | null
          harga_beli?: number
          harga_jual?: number
          stok?: number
          satuan?: string
          gambar_url?: string | null
          aktif?: boolean
          created_at?: string
        }
      }
      pos_transaksi: {
        Row: {
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
        }
        Insert: {
          id?: string
          org_id: string
          nomor: string
          santri_id: string
          total: number
          metode_bayar?: string
          status?: PosStatus
          kasir_id: string
          void_reason?: string | null
          voided_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          nomor?: string
          santri_id?: string
          total?: number
          metode_bayar?: string
          status?: PosStatus
          kasir_id?: string
          void_reason?: string | null
          voided_at?: string | null
          created_at?: string
        }
      }
      pos_transaksi_detail: {
        Row: {
          id: string
          pos_transaksi_id: string
          produk_id: string
          nama_produk: string
          harga_beli: number
          harga_jual: number
          qty: number
          subtotal: number
        }
        Insert: {
          id?: string
          pos_transaksi_id: string
          produk_id: string
          nama_produk: string
          harga_beli: number
          harga_jual: number
          qty: number
          subtotal: number
        }
        Update: {
          id?: string
          pos_transaksi_id?: string
          produk_id?: string
          nama_produk?: string
          harga_beli?: number
          harga_jual?: number
          qty?: number
          subtotal?: number
        }
      }
      stok_log: {
        Row: {
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
        }
        Insert: {
          id?: string
          org_id: string
          produk_id: string
          tipe: StokLogType
          qty: number
          stok_sebelum: number
          stok_sesudah: number
          keterangan?: string | null
          ref_id?: string | null
          dibuat_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          produk_id?: string
          tipe?: StokLogType
          qty?: number
          stok_sebelum?: number
          stok_sesudah?: number
          keterangan?: string | null
          ref_id?: string | null
          dibuat_oleh?: string | null
          created_at?: string
        }
      }
      chart_of_accounts: {
        Row: {
          id: string
          org_id: string
          kode: string
          nama: string
          tipe: CoaType
          parent_id: string | null
          is_system: boolean
          urutan: number
          aktif: boolean
        }
        Insert: {
          id?: string
          org_id: string
          kode: string
          nama: string
          tipe: CoaType
          parent_id?: string | null
          is_system?: boolean
          urutan?: number
          aktif?: boolean
        }
        Update: {
          id?: string
          org_id?: string
          kode?: string
          nama?: string
          tipe?: CoaType
          parent_id?: string | null
          is_system?: boolean
          urutan?: number
          aktif?: boolean
        }
      }
      jurnal: {
        Row: {
          id: string
          org_id: string
          tanggal: string
          nomor: string
          keterangan: string
          ref_id: string | null
          ref_type: JurnalRefType | null
          dibuat_oleh: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          tanggal: string
          nomor: string
          keterangan: string
          ref_id?: string | null
          ref_type?: JurnalRefType | null
          dibuat_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          tanggal?: string
          nomor?: string
          keterangan?: string
          ref_id?: string | null
          ref_type?: JurnalRefType | null
          dibuat_oleh?: string | null
          created_at?: string
        }
      }
      jurnal_detail: {
        Row: {
          id: string
          jurnal_id: string
          coa_id: string
          debet: number
          kredit: number
        }
        Insert: {
          id?: string
          jurnal_id: string
          coa_id: string
          debet?: number
          kredit?: number
        }
        Update: {
          id?: string
          jurnal_id?: string
          coa_id?: string
          debet?: number
          kredit?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
