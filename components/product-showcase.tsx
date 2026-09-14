"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence, type Variants } from "motion/react"
import { ProductCard } from "@/components/product-card"
import type { Category, Product } from "@/lib/products"

const filters: { key: Category | "todos" | "novidades"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "tenis", label: "Tênis" },
  { key: "sandalia", label: "Sandálias" },
  { key: "bermuda", label: "Bermudas" },
  { key: "camisa", label: "Camisas" },
  { key: "novidades", label: "Novidades" },
  { key: "kits", label: "Kits" },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export function ProductShowcase({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Category | "todos" | "novidades">("todos")

  const list = useMemo(() => {
    if (active === "todos") return products
    if (active === "novidades") return products.filter((p) => p.isNew)
    return products.filter((p) => p.category === active)
  }, [active, products])

  return (
    <section id="mais-desejados" className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
          Mais desejados
        </h2>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          {filters.map((f) => (
            <motion.button
              key={f.key}
              onClick={() => setActive(f.key)}
              aria-pressed={active === f.key}
              whileTap={{ scale: 0.94 }}
              className={`relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active === f.key
                  ? "border-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {active === f.key && (
                <motion.span
                  layoutId="active-filter"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{f.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {list.map((product) => (
            <motion.div key={product.slug} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
