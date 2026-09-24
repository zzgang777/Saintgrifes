"use client"

import { useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react"
import type { AdminSessionData } from "@/lib/admin-session"

type Child = { href: string; label: string }
type NavItem =
  | { kind: "link"; href: string; label: string; hint: string; icon: LucideIcon }
  | { kind: "group"; id: string; label: string; hint: string; icon: LucideIcon; children: Child[] }

const NAV_MEMBER: NavItem[] = [
  { kind: "link", href: "/admin/pedidos", label: "Pedidos", hint: "Vendas e pagamentos", icon: ShoppingCart },
]

const NAV_OWNER: NavItem[] = [
  { kind: "link", href: "/admin", label: "Dashboard", hint: "Visão geral da loja", icon: LayoutDashboard },
  { kind: "link", href: "/admin/estatisticas", label: "Estatísticas", hint: "Eventos do site", icon: BarChart3 },
  {
    kind: "group",
    id: "produtos",
    label: "Produtos",
    hint: "Catálogo da loja",
    icon: Package,
    children: [
      { href: "/admin/produtos", label: "Todos os produtos" },
      { href: "/admin/produtos/novo", label: "Novo produto" },
      { href: "/admin/categorias", label: "Categorias" },
    ],
  },
  { kind: "link", href: "/admin/pedidos", label: "Pedidos", hint: "Vendas e pagamentos", icon: ShoppingCart },
  { kind: "link", href: "/admin/cupons", label: "Cupons", hint: "Descontos pra clientes", icon: Ticket },
  {
    kind: "group",
    id: "config",
    label: "Configurações",
    hint: "Loja e equipe",
    icon: Settings,
    children: [
      { href: "/admin/configuracoes", label: "Geral" },
      { href: "/admin/equipe", label: "Equipe" },
    ],
  },
]

const TITLES: [string, string][] = [
  ["/admin/produtos/novo", "Novo produto"],
  ["/admin/produtos", "Produtos"],
  ["/admin/categorias", "Categorias"],
  ["/admin/pedidos", "Pedidos"],
  ["/admin/cupons/novo", "Criar cupom"],
  ["/admin/cupons", "Cupons"],
  ["/admin/estatisticas", "Estatísticas"],
  ["/admin/configuracoes", "Configurações"],
  ["/admin/equipe/novo", "Adicionar membro"],
  ["/admin/equipe", "Equipe"],
  ["/admin/sem-acesso", "Sem permissão"],
]

function titleFor(pathname: string) {
  return TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard"
}

function childActive(pathname: string, href: string) {
  if (href === "/admin/produtos") return pathname.startsWith("/admin/produtos") && pathname !== "/admin/produtos/novo"
  return pathname === href
}

export function AdminShell({ children, session }: { children: ReactNode; session: AdminSessionData | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [today, setToday] = useState("")

  const isMember = session?.role === "member"
  const NAV = isMember ? NAV_MEMBER : NAV_OWNER
  const displayName = isMember ? session.email : "Administrador"
  const displayHint = isMember ? "Membro da equipe" : "Painel"
  const avatarLetter = displayName[0]?.toUpperCase() ?? "A"

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Fortaleza" }).format(new Date()),
    )
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  const groupOpen = (item: Extract<NavItem, { kind: "group" }>) =>
    open[item.id] ?? item.children.some((c) => childActive(pathname, c.href))

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const showLabels = !collapsed || mobileOpen

  const sidebar = (
    <aside
      className={`flex h-dvh shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 transition-[width] duration-200 ${
        showLabels ? "w-64" : "w-[76px]"
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-zinc-800 px-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <Image src="/saint-grifes-logo.webp" alt="" width={36} height={33} className="h-8 w-auto shrink-0" />
          {showLabels && <span className="truncate text-base font-bold text-white">Saint Grifes</span>}
        </Link>
        <button
          type="button"
          onClick={() => (mobileOpen ? setMobileOpen(false) : setCollapsed((v) => !v))}
          aria-label={mobileOpen ? "Fechar menu" : collapsed ? "Expandir menu" : "Recolher menu"}
          className="hidden size-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white lg:flex"
        >
          <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Menu do painel">
        {NAV.map((item) => {
          const Icon = item.icon
          if (item.kind === "link") {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  active ? "bg-indigo-500/15 text-indigo-300" : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                }`}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {showLabels && (
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">{item.label}</span>
                    <span className="block truncate text-[11px] text-zinc-500">{item.hint}</span>
                  </span>
                )}
              </Link>
            )
          }

          const isOpen = groupOpen(item)
          const anyActive = item.children.some((c) => childActive(pathname, c.href))
          return (
            <div key={item.id}>
              <button
                type="button"
                title={item.label}
                aria-expanded={isOpen}
                onClick={() => {
                  if (!showLabels) {
                    setCollapsed(false)
                    setOpen((o) => ({ ...o, [item.id]: true }))
                    return
                  }
                  setOpen((o) => ({ ...o, [item.id]: !isOpen }))
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  anyActive && !isOpen ? "bg-indigo-500/15 text-indigo-300" : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                }`}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {showLabels && (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-tight">{item.label}</span>
                      <span className="block truncate text-[11px] text-zinc-500">{item.hint}</span>
                    </span>
                    <ChevronDown className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </>
                )}
              </button>
              {showLabels && isOpen && (
                <div className="ml-[22px] mt-1 flex flex-col gap-0.5 border-l border-zinc-800 pl-3">
                  {item.children.map((child) => {
                    const active = childActive(pathname, child.href)
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                          active ? "bg-indigo-500/15 font-medium text-indigo-300" : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-zinc-800 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Ver site"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/70 hover:text-white"
        >
          <ExternalLink className="size-[18px] shrink-0" aria-hidden />
          {showLabels && "Ver site"}
        </a>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
            {avatarLetter}
          </span>
          {showLabels && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{displayName}</span>
              <span className="block truncate text-[11px] text-zinc-500">Acesso ao painel</span>
            </span>
          )}
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-dvh lg:block">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-y-0 left-0">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/85 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{titleFor(pathname)}</p>
              <p className="truncate text-xs text-zinc-500">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[180px] truncate text-sm font-medium text-white">{displayName}</p>
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">{displayHint}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
              {avatarLetter}
            </span>
            <button
              type="button"
              onClick={logout}
              aria-label="Sair do painel"
              title="Sair"
              className="flex size-9 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="size-[18px]" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
