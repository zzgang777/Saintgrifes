"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Check } from "lucide-react"
import { track } from "@/lib/track"
import { useCart } from "@/components/cart-provider"
import { ProductBadge } from "@/components/product-badge"
import { formatBRL } from "@/lib/format"
import { openInstagramDm } from "@/lib/site"
import { isSizeAvailable, isSoldOut, type Product } from "@/lib/products"

const categoryStamp: Record<Product["category"], string> = {
  tenis: "bg-chrome text-chrome-foreground",
  sandalia: "bg-accent text-accent-foreground",
  bermuda: "bg-bone text-ink",
  camisa: "bg-primary text-primary-foreground",
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const soldOut = isSoldOut(product)
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 && isSizeAvailable(product, product.sizes[0]) ? product.sizes[0] : null,
  )
  const [error, setError] = useState(false)
  const [added, setAdded] = useState(false)
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (addedTimer.current) clearTimeout(addedTimer.current)
  }, [])

  const price = product.salePrice ?? product.price
  const hasSale = product.salePrice != null
  const discount = hasSale ? Math.round((1 - price / product.price) * 100) : 0

  const handleBuy = () => {
    if (soldOut) return
    if (!size) {
      setError(true)
      return
    }
    if (product.onRequest) {
      track("Consultar no Instagram", { product: product.name, category: product.categoryLabel })
      openInstagramDm(`Olá! Tenho interesse no ${product.name} (tamanho ${size}). Pode me passar o valor?`)
      setAdded(true)
      if (addedTimer.current) clearTimeout(addedTimer.current)
      addedTimer.current = setTimeout(() => setAdded(false), 1400)
      return
    }
    track("Adicionar ao carrinho", { product: product.name, category: product.categoryLabel })
    addItem(product, size)
    setAdded(true)
    if (addedTimer.current) clearTimeout(addedTimer.current)
    addedTimer.current = setTimeout(() => setAdded(false), 1400)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-xl hover:shadow-primary/10"
    >
      <Link
        href={`/produto/${product.slug}`}
        onClick={() => track("Clique em produto", { product: product.name, category: product.categoryLabel })}
        className="relative aspect-[4/5] overflow-hidden bg-secondary"
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {soldOut ? <ProductBadge label="ESGOTADO" /> : product.badge && <ProductBadge label={product.badge} />}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[tape-sweep_0.9s_linear_1]"
          aria-hidden
        />
      </Link>

      {/* Talão perfurado — separa a foto da etiqueta, como um talão de loja */}
      <div className="relative h-4 shrink-0">
        <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-border" />
        <span className="absolute left-0 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute right-0 top-1/2 size-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-background" />
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${categoryStamp[product.category]}`}
        >
          {product.categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
        <Link
          href={`/produto/${product.slug}`}
          className="font-display text-lg uppercase leading-[1.05] tracking-tight text-balance line-clamp-2 hover:text-signal"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          {product.onRequest ? (
            <span className="font-display text-xl text-foreground">Sob consulta</span>
          ) : (
            <>
              <span className="font-display text-xl text-foreground">{formatBRL(price)}</span>
              {hasSale && (
                <>
                  <span className="text-sm text-muted-foreground line-through">{formatBRL(product.price)}</span>
                  <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    -{discount}%
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Seleção de tamanho */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Selecionar tamanho">
            {product.sizes.map((s) => {
              const available = isSizeAvailable(product, s)
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setSize(s)
                    setError(false)
                  }}
                  aria-pressed={size === s}
                  className={`min-w-8 rounded-md px-2 py-1 text-xs font-bold transition-all ${
                    !available
                      ? "cursor-not-allowed bg-secondary/50 text-muted-foreground/50 line-through"
                      : size === s
                        ? "-rotate-2 bg-chrome text-chrome-foreground shadow-sm"
                        : "bg-secondary text-foreground/60 hover:bg-secondary/70"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
          {error && <p className="mt-1.5 text-xs text-signal">Selecione um tamanho.</p>}
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            onClick={handleBuy}
            disabled={soldOut}
            className="w-full rounded-sm bg-primary py-2.5 font-display text-lg font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? "added" : "buy"}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center justify-center gap-1.5"
              >
                {soldOut ? (
                  "Esgotado"
                ) : added ? (
                  <>
                    <Check className="size-5" aria-hidden />
                    {product.onRequest ? "Mensagem copiada" : "Adicionado"}
                  </>
                ) : product.onRequest ? (
                  "Consultar no Instagram"
                ) : (
                  "Comprar"
                )}
              </motion.span>
            </AnimatePresence>
          </button>
          <Link
            href={`/produto/${product.slug}`}
            className="text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
