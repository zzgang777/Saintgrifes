"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react"
import { Menu, Search, ShoppingBag, User, X } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { SearchDialog } from "@/components/search-dialog"
import { siteConfig } from "@/lib/site"

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Camisas", href: "/#categorias" },
  { label: "Bermudas", href: "/#categorias" },
  { label: "Novidades", href: "/#mais-desejados" },
  { label: "Contato", href: "/contato" },
]

export function SiteHeader() {
  const { count, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 })

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:flex lg:h-20 lg:justify-between">
          <button
            className="w-fit justify-self-start lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-6" />
          </button>

          <Link href="/" aria-label="Saint Grifes - Início" className="shrink-0">
            <span className="logo-coin relative block aspect-[960/869] h-11 lg:h-14">
              <span className="logo-coin__spinner absolute inset-0">
                <span className="logo-coin__face absolute inset-0">
                  <Image src="/saint-grifes-logo.webp" alt="Saint Grifes" fill priority sizes="128px" className="object-contain" />
                </span>
                <span className="logo-coin__face logo-coin__face--back absolute inset-0" aria-hidden>
                  <Image src="/saint-grifes-logo.webp" alt="" fill sizes="128px" className="object-contain" />
                </span>
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-full border border-border p-1.5 lg:flex"
            aria-label="Navegação principal"
            onMouseLeave={() => setHovered(null)}
          >
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHovered(i)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  hovered === i ? "text-primary-foreground" : "text-foreground/80"
                }`}
              >
                {hovered === i && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 justify-self-end">
            <button onClick={() => setSearchOpen(true)} aria-label="Pesquisar" className="hover:text-signal">
              <Search className="size-5" />
            </button>
            <Link href="/conta" aria-label="Minha conta" className="hidden hover:text-signal sm:block">
              <User className="size-5" />
            </Link>
            <button onClick={openCart} aria-label="Carrinho" className="relative hover:text-signal">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 1.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                  className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
                >
                  {count}
                </motion.span>
              )}
            </button>
          </div>
        </div>
        <motion.div
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-signal"
          style={{ scaleX: progress }}
          aria-hidden
        />
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <motion.div
              className="absolute left-0 top-0 flex h-dvh w-[80%] max-w-xs flex-col bg-card p-6 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            >
              <div className="mb-8 flex items-center justify-end">
                <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                  <X className="size-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary hover:text-signal"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/conta"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary hover:text-signal"
                >
                  Minha conta
                </Link>
              </nav>
              <p className="mt-auto text-sm text-muted-foreground">{siteConfig.tagline}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
