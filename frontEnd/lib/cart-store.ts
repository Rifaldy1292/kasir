import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface CartProduct {
  id: number
  sku: string
  barcode: string
  name: string
  sell_price: number
  buy_price: number
  stock: number
  unit: string
  image_url: string
}

export interface CartItem {
  product: CartProduct
  qty: number
  discountAmount: number
  subtotal: number
}

export interface Customer {
  id: number
  name: string
  phone: string
}

export interface HeldCart {
  id: string
  heldAt: Date | string
  customerName: string
  items: CartItem[]
  discountAmount: number
  notes: string
}

interface CartState {
  items: CartItem[]
  customer: Customer | null
  taxRate: number
  discountAmount: number
  notes: string
  heldCarts: HeldCart[]

  // Actions
  addItem: (product: CartProduct, qty?: number) => void
  removeItem: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  setItemDiscount: (productId: number, discount: number) => void
  setCustomer: (customer: Customer | null) => void
  setTaxRate: (rate: number) => void
  setDiscountAmount: (discount: number) => void
  setNotes: (notes: string) => void
  clearCart: () => void
  syncWithCatalog: (catalogProducts: CartProduct[]) => void

  // Hold & Resume
  holdCurrentCart: (label?: string) => void
  resumeCart: (heldId: string) => void
  deleteHeldCart: (heldId: string) => void

  // Calculations
  getSubtotal: () => number
  getTaxAmount: () => number
  getTotalAmount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],
  customer: null,
  taxRate: 0,
  discountAmount: 0,
  notes: "",
  heldCarts: [],

  addItem: (product, qty = 1) => {
    const { items } = get()
    const existingIndex = items.findIndex((i) => i.product.id === product.id)

    if (existingIndex > -1) {
      const existing = items[existingIndex]
      const newQty = existing.qty + qty
      const subtotal = Math.max(0, product.sell_price * newQty - existing.discountAmount)

      const updatedItems = [...items]
      updatedItems[existingIndex] = {
        ...existing,
        qty: newQty,
        subtotal,
      }
      set({ items: updatedItems })
    } else {
      const subtotal = Math.max(0, product.sell_price * qty)
      set({
        items: [
          ...items,
          {
            product,
            qty,
            discountAmount: 0,
            subtotal,
          },
        ],
      })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) })
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId)
      return
    }

    set({
      items: get().items.map((i) => {
        if (i.product.id === productId) {
          const subtotal = Math.max(0, i.product.sell_price * qty - i.discountAmount)
          return { ...i, qty, subtotal }
        }
        return i
      }),
    })
  },

  setItemDiscount: (productId, discount) => {
    set({
      items: get().items.map((i) => {
        if (i.product.id === productId) {
          const subtotal = Math.max(0, i.product.sell_price * i.qty - discount)
          return { ...i, discountAmount: discount, subtotal }
        }
        return i
      }),
    })
  },

  setCustomer: (customer) => set({ customer }),
  setTaxRate: (taxRate) => set({ taxRate }),
  setDiscountAmount: (discountAmount) => set({ discountAmount }),
  setNotes: (notes) => set({ notes }),

  clearCart: () =>
    set({
      items: [],
      customer: null,
      discountAmount: 0,
      notes: "",
    }),

  syncWithCatalog: (catalogProducts) => {
    if (!catalogProducts || catalogProducts.length === 0) return
    const catalogMap = new Map<number, CartProduct>()
    for (const p of catalogProducts) {
      catalogMap.set(p.id, p)
    }

    const { items } = get()
    let hasChanged = false

    const updatedItems = items.map((item) => {
      const latest = catalogMap.get(item.product.id)
      if (latest) {
        if (
          latest.sell_price !== item.product.sell_price ||
          latest.name !== item.product.name ||
          latest.stock !== item.product.stock
        ) {
          hasChanged = true
          const subtotal = Math.max(0, latest.sell_price * item.qty - item.discountAmount)
          return {
            ...item,
            product: latest,
            subtotal,
          }
        }
      }
      return item
    })

    if (hasChanged) {
      set({ items: updatedItems })
    }
  },

  holdCurrentCart: (label) => {
    const { items, customer, discountAmount, notes, heldCarts } = get()
    if (items.length === 0) return

    const newHeldCart: HeldCart = {
      id: "HOLD-" + Date.now(),
      heldAt: new Date(),
      customerName: customer ? customer.name : label || `Pesanan #${heldCarts.length + 1}`,
      items: [...items],
      discountAmount,
      notes,
    }

    set({
      heldCarts: [newHeldCart, ...heldCarts],
      items: [],
      customer: null,
      discountAmount: 0,
      notes: "",
    })
  },

  resumeCart: (heldId) => {
    const { heldCarts } = get()
    const target = heldCarts.find((h) => h.id === heldId)
    if (!target) return

    set({
      items: target.items,
      discountAmount: target.discountAmount,
      notes: target.notes,
      heldCarts: heldCarts.filter((h) => h.id !== heldId),
    })
  },

  deleteHeldCart: (heldId) => {
    set({
      heldCarts: get().heldCarts.filter((h) => h.id !== heldId),
    })
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0)
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal()
    const rate = get().taxRate
    if (rate <= 0) return 0
    return (subtotal * rate) / 100
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal()
    const tax = get().getTaxAmount()
    const discount = get().discountAmount
    return Math.max(0, subtotal + tax - discount)
  },
    }),
    {
      name: "thekasir_pos_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        customer: state.customer,
        taxRate: state.taxRate,
        discountAmount: state.discountAmount,
        notes: state.notes,
        heldCarts: state.heldCarts,
      }),
    }
  )
)
