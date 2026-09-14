"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react"
import { track } from "@vercel/analytics"
import { useCart } from "@/components/cart-provider"
import { ProductBadge } from "@/components/product-badge"
import { formatBRL } from "@/lib/format"
import { siteConfig, whatsappLink } from "@/lib/site"
import type { Product } from "@/lib/products"

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState(false)

  const price = product.salePrice ?? product.price
  const hasSale = product.salePrice != null

  const handleAdd = () => {
    if (!size) {
      setError(true)
      return
    }
    track("Adicionar ao carrinho", { product: product.name, category: product.categoryLabel })
    addItem(product, size, quantity)
  }

  const handleWhatsapp = () => {
    if (!size) {
      setError(true)
      return
    }
    track(product.onRequest ? "Consultar no WhatsApp" : "WhatsApp produto", {
      product: product.name,
      category: product.categoryLabel,
    })
    const msg = product.onRequest
      ? `Olá! Tenho interesse no *${product.name}* (tamanho ${size}, quantidade ${quantity}). Pode me passar o valor?`
      : `Olá! Tenho interesse na peça *${product.name}*${size ? ` (tamanho ${size})` : ""} — ${formatBRL(price)}. Está disponível?`
    window.open(whatsappLink(msg), "_blank")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <Link
        href="/#mais-desejados"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Voltar para a loja
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {product.badge && <ProductBadge label={product.badge} size="sm" />}
        </div>

        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-wide text-muted-foreground">{product.categoryLabel}</span>
          <h1 className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl text-balance">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            {product.onRequest ? (
              <span className="font-display text-3xl text-primary">Sob consulta</span>
            ) : (
              <>
                <span className="font-display text-3xl text-primary">{formatBRL(price)}</span>
                {hasSale && (
                  <span className="text-lg text-muted-foreground line-through">{formatBRL(product.price)}</span>
                )}
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground text-pretty">{product.description}</p>

          {/* Tamanho */}
          <div className="mt-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide">Tamanho</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar tamanho">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s)
                    setError(false)
                  }}
                  aria-pressed={size === s}
                  className={`flex min-w-12 items-center justify-center gap-1 rounded-lg border px-4 py-2.5 font-medium transition-colors ${
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}
                >
                  {size === s && <Check className="size-4" />}
                  {s}
                </button>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-primary">Selecione um tamanho para continuar.</p>}
          </div>

          {/* Quantidade */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide">Quantidade</p>
            <div className="flex w-fit items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                className="flex size-11 items-center justify-center text-foreground hover:text-primary"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar quantidade"
                className="flex size-11 items-center justify-center text-foreground hover:text-primary"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-8 flex flex-col gap-3">
            {product.onRequest ? (
              <button
                onClick={handleWhatsapp}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-accent"
              >
                <ShoppingBag className="size-5" />
                Consultar no WhatsApp
              </button>
            ) : (
              <>
                <button
                  onClick={handleAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-accent"
                >
                  <ShoppingBag className="size-5" />
                  Adicionar ao carrinho
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleAdd()
                      if (size) openCart()
                    }}
                    className="rounded-lg border border-border py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    Comprar agora
                  </button>
                  <button
                    onClick={handleWhatsapp}
                    className="rounded-lg bg-foreground py-3.5 text-sm font-semibold uppercase tracking-wide text-background transition-opacity hover:opacity-90"
                  >
                    WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Dúvidas sobre esta peça? Fale com a {siteConfig.name} pelo WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}
