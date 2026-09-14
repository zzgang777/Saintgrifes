"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import type { CategoryTile } from "@/lib/products"

function Tile({
  cat,
  className,
  labelSize = "text-2xl",
}: {
  cat: CategoryTile | undefined
  className: string
  labelSize?: string
}) {
  if (!cat) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Link href="/#mais-desejados" className="group relative flex h-full flex-col justify-end overflow-hidden rounded-xl bg-foreground">
        <Image
          src={cat.image || "/placeholder.svg"}
          alt={`Categoria ${cat.label}`}
          fill
          className="object-cover object-center grayscale-[60%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
        <div className="relative flex items-end justify-between gap-3 p-5">
          <div>
            <h3 className={`font-display ${labelSize} uppercase text-white`}>{cat.label}</h3>
            <p className="mt-1 text-sm text-white/70">{cat.description}</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-1 group-hover:rotate-45">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

export function CategoriesGrid({ categories }: { categories: CategoryTile[] }) {
  const byKey = Object.fromEntries(categories.map((c) => [c.key, c]))

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:auto-rows-[240px]">
      <Tile cat={byKey.tenis} className="col-span-2 aspect-[4/3] lg:col-span-2 lg:row-span-2 lg:aspect-auto" labelSize="text-3xl lg:text-4xl" />
      <Tile cat={byKey.camisa} className="col-span-2 aspect-[16/9] lg:col-span-2 lg:row-span-1 lg:aspect-auto" />
      <Tile cat={byKey.sandalia} className="aspect-square lg:aspect-auto" />
      <Tile cat={byKey.bermuda} className="aspect-square lg:aspect-auto" />
      <Tile cat={byKey.kits} className="col-span-2 aspect-[16/9] lg:col-span-2 lg:row-span-1 lg:aspect-auto" />
      <Tile cat={byKey.novidades} className="col-span-2 aspect-[16/9] lg:col-span-2 lg:row-span-1 lg:aspect-auto" />
    </div>
  )
}
