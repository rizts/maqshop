import { create } from 'zustand'
import type { Profile, Organization, CartItem, Produk } from '@/types'

// ==========================================
// AUTH STORE
// ==========================================
interface AuthState {
  user: any | null // Supabase session user
  profile: Profile | null
  organization: Organization | null
  setUser: (user: any | null) => void
  setProfile: (profile: Profile | null) => void
  setOrganization: (org: Organization | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  organization: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (org) => set({ organization: org }),
  clearAuth: () => set({ user: null, profile: null, organization: null }),
}))
