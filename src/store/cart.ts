import { create } from 'zustand'
import type { CartItem, Product } from '../types'

type CartState = {
  items: CartItem[]
  add: (product: Product, quantity?: number) => void
  remove: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (product, quantity = 1) => set((state) => {
    const existing = state.items.find((i) => i.productId === product.id)
    if (existing) {
      const newQuantity = existing.quantity + quantity
      const unitPrice = product.price
      const totalPrice = newQuantity * unitPrice
      return {
        items: state.items.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQuantity, totalPrice } : i
        ),
      }
    }
    const newItem: CartItem = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    }
    return { items: [...state.items, newItem] }
  }),
  remove: (productId) => set((state) => ({
    items: state.items.filter((i) => i.productId !== productId),
  })),
  setQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.productId === productId
        ? { ...i, quantity, totalPrice: i.unitPrice * quantity }
        : i
    ),
  })),
  clear: () => set({ items: [] }),
}))

export const cartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice / 1.13, 0)
  const tax = items.reduce((sum, i) => sum + i.totalPrice - i.totalPrice / 1.13, 0)
  const total = items.reduce((sum, i) => sum + i.totalPrice, 0)
  return {
    subtotalWithoutTax: Number(subtotal.toFixed(2)),
    taxAmount: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}