import type { Metadata } from "next"
import { PackageSearch } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartProvider } from "@/components/cart-provider"
import { CartDrawer } from "@/components/cart-drawer"
import { LogoutButton } from "@/components/auth/logout-button"
import { getCurrentUser } from "@/lib/supabase/server"
import { listOrdersForUser, type OrderStatus } from "@/lib/orders"
import { formatBRL } from "@/lib/format"

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false },
}

const statusLabel: Record<OrderStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Recusado",
  cancelled: "Cancelado",
}

export default async function AccountPage() {
  const user = await getCurrentUser()
  // O proxy.ts já manda pra /conta/entrar quem não está logado; isso aqui é só uma segunda trava.
  if (!user) return null

  const orders = await listOrdersForUser(user.id)
  const name = (user.user_metadata?.name as string | undefined) || user.email

  return (
    <CartProvider>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 lg:py-24">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl">Minha conta</h1>
            <p className="mt-2 text-muted-foreground">
              {name} — {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Meus pedidos</h2>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-card py-16 text-center">
            <PackageSearch className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-md border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <ul className="mt-3 flex flex-col gap-1 text-sm">
                  {order.items.map((item) => (
                    <li key={`${item.slug}-${item.size}`}>
                      {item.quantity}x {item.name} <span className="text-muted-foreground">({item.size})</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-sm font-medium text-signal">{statusLabel[order.status]}</span>
                  <span className="font-display text-lg">{formatBRL(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  )
}
