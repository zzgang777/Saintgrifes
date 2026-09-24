"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Product } from "@/lib/products"

export type CartItem = {
  slug: string
  name: string
  price: number
  image: string
  size: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  count: number
  subtotal: number
  addItem: (product: Product, size: string, quantity?: number) => void
  removeItem: (slug: string, size: string) => void
  updateQuantity: (slug: string, size: string, quantity: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = "saint-grifes-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem: CartContextValue["addItem"] = (product, size, quantity = 1) => {
    const price = product.salePrice ?? product.price
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug && i.size === size)
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug && i.size === size ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { slug: product.slug, name: product.name, price, image: product.image, size, quantity }]
    })
    setIsOpen(true)
  }

  const removeItem: CartContextValue["removeItem"] = (slug, size) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.size === size)))
  }

  const updateQuantity: CartContextValue["updateQuantity"] = (slug, size, quantity) => {
    if (quantity <= 0) {
      removeItem(slug, size)
      return
    }
    setItems((prev) => prev.map((i) => (i.slug === slug && i.size === size ? { ...i, quantity } : i)))
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return {
      items,
      isOpen,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clear: () => setItems([]),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }
  }, [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider")
  return ctx
}
