"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { track } from "@vercel/analytics"
import { useCart } from "@/components/cart-provider"
import { ProductBadge } from "@/components/product-badge"
import { formatBRL } from "@/lib/format"
import { whatsappLink } from "@/lib/site"
import type { Product } from "@/lib/products"

const categoryStamp: Record<Product["category"], string> = {
  tenis: "bg-sunset text-sunset-foreground",
  sandalia: "bg-accent text-primary-foreground",
  bermuda: "bg-foreground text-background",
  camisa: "bg-primary text-primary-foreground",
  kits: "bg-secondary text-foreground",
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [error, setError] = useState(false)

  const price = product.salePrice ?? product.price
  const hasSale = product.salePrice != null
  const discount = hasSale ? Math.round((1 - price / product.price) * 100) : 0

  const handleBuy = () => {
    if (!size) {
      setError(true)
      return
    }
    if (product.onRequest) {
      track("Consultar no WhatsApp", { product: product.name, category: product.categoryLabel })
      window.open(whatsappLink(`Olá! Tenho interesse no ${product.name} (tamanho ${size}). Pode me passar o valor?`), "_blank")
      return
    }
    track("Adicionar ao carrinho", { product: product.name, category: product.categoryLabel })
    addItem(product, size)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl hover:shadow-primary/10"
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
        {product.badge && <ProductBadge label={product.badge} />}
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
          className="font-display text-lg uppercase leading-[1.05] tracking-tight text-balance line-clamp-2 hover:text-primary"
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
                  <span className="rounded-full bg-sunset px-2 py-0.5 text-[10px] font-bold text-sunset-foreground">
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
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s)
                  setError(false)
                }}
                aria-pressed={size === s}
                className={`min-w-8 rounded-md px-2 py-1 text-xs font-bold transition-all ${
                  size === s
                    ? "-rotate-2 bg-foreground text-background shadow-sm"
                    : "bg-secondary text-foreground/60 hover:bg-secondary/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className="mt-1.5 text-xs text-primary">Selecione um tamanho.</p>}
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            onClick={handleBuy}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-accent"
          >
            {product.onRequest ? "Consultar no WhatsApp" : "Comprar"}
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
