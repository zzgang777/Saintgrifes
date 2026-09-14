"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BarChart3, ShoppingCart, Grid3x3, Package, Settings, Users, ExternalLink } from "lucide-react"
import { LogoutButton } from "@/components/admin/logout-button"

const sections = [
  {
    title: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/estatisticas", label: "Estatísticas", icon: BarChart3 },
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/admin/categorias", label: "Categorias", icon: Grid3x3 },
      { href: "/admin/produtos", label: "Produtos", icon: Package },
    ],
  },
  {
    title: "Loja",
    items: [{ href: "/admin/configuracoes", label: "Configurações", icon: Settings }],
  },
  {
    title: "Geral",
    items: [{ href: "/admin/equipe", label: "Equipe", icon: Users }],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
          EI
        </span>
        <span className="text-sm font-semibold text-white">Estilo da Ilha</span>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{section.title}</p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-red-600/15 text-red-500" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-zinc-800 pt-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <ExternalLink className="size-4" />
          Ver site
        </a>
        <LogoutButton />
      </div>
    </aside>
  )
}
