"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatBRL } from "@/lib/format"

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, count } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            className="fixed right-0 top-0 z-[80] flex h-dvh w-[92%] max-w-md flex-col bg-card shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-label="Carrinho de compras"
            aria-modal="true"
          >
            <header className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-signal" aria-hidden />
                <h2 className="font-display text-xl uppercase tracking-wide">Meu Carrinho</h2>
                <span className="text-sm text-muted-foreground">({count})</span>
              </div>
              <button onClick={closeCart} aria-label="Fechar carrinho" className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <ShoppingBag className="size-12 text-muted-foreground" aria-hidden />
                  <p className="font-medium text-foreground">Seu carrinho está vazio</p>
                  <p className="text-sm text-muted-foreground">Adicione peças e volte aqui para finalizar.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={`${item.slug}-${item.size}`}
                        className="flex gap-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight text-foreground">{item.name}</p>
                            <button
                              onClick={() => removeItem(item.slug, item.size)}
                              aria-label={`Remover ${item.name}`}
                              className="text-muted-foreground hover:text-signal"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">Tamanho: {item.size}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-md border border-border">
                              <button
                                onClick={() => updateQuantity(item.slug, item.size, item.quantity - 1)}
                                aria-label="Diminuir quantidade"
                                className="flex size-8 items-center justify-center text-foreground hover:text-signal"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.slug, item.size, item.quantity + 1)}
                                aria-label="Aumentar quantidade"
                                className="flex size-8 items-center justify-center text-foreground hover:text-signal"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="font-semibold text-foreground">{formatBRL(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-border p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-2xl text-foreground">{formatBRL(subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-accent"
                >
                  Finalizar compra
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Pagamento seguro pelo Mercado Pago.
                </p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
