"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Search, X } from "lucide-react"
import type { Product } from "@/lib/products"
import { formatBRL } from "@/lib/format"

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || products.length > 0) return
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
  }, [open, products.length])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="relative mx-auto mt-20 w-[92%] max-w-2xl rounded-xl bg-card p-4 shadow-2xl"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Search className="size-5 text-muted-foreground" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos, categorias..."
                className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Buscar produtos"
              />
              <button onClick={onClose} aria-label="Fechar busca" className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-y-auto">
              {query && results.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</p>
              )}
              {!query && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Digite para buscar entre nossas peças.
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/produto/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-secondary"
                    >
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <Image src={p.image || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.categoryLabel}</p>
                      </div>
                      <span className="font-semibold text-signal">{formatBRL(p.salePrice ?? p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
