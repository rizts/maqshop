import { create } from 'zustand'
import type { CartItem, Produk, Santri } from '@/types'

// ==========================================
// CART STORE (POS)
// ==========================================
interface CartState {
  items: CartItem[]
  selectedSantri: Santri | null
  addItem: (produk: Produk, qty?: number) => void
  removeItem: (produkId: string) => void
  updateQty: (produkId: string, qty: number) => void
  clearCart: () => void
  setSelectedSantri: (santri: Santri | null) => void
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedSantri: null,
  
  addItem: (produk, qty = 1) => set((state) => {
    const existing = state.items.find(item => item.produk.id === produk.id)
    if (existing) {
      return {
        items: state.items.map(item => 
          item.produk.id === produk.id 
            ? { ...item, qty: item.qty + qty, subtotal: (item.qty + qty) * item.produk.harga_jual }
            : item
        )
      }
    }
    return {
      items: [...state.items, { produk, qty, subtotal: qty * produk.harga_jual }]
    }
  }),
  
  removeItem: (produkId) => set((state) => ({
    items: state.items.filter(item => item.produk.id !== produkId)
  })),
  
  updateQty: (produkId, qty) => set((state) => {
    if (qty <= 0) {
      return { items: state.items.filter(item => item.produk.id !== produkId) }
    }
    return {
      items: state.items.map(item => 
        item.produk.id === produkId 
          ? { ...item, qty, subtotal: qty * item.produk.harga_jual }
          : item
      )
    }
  }),
  
  clearCart: () => set({ items: [], selectedSantri: null }),
  
  setSelectedSantri: (santri) => set({ selectedSantri: santri }),
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.subtotal, 0)
  }
}))
