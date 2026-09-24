import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CartProvider } from "@/components/cart-provider"
import { SiteHeader } from "@/components/site-header"
import { OrderResult, type ResultKind } from "@/components/order-result"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"

const kinds: ResultKind[] = ["sucesso", "pendente", "recusado"]

export const metadata: Metadata = {
  title: "Seu pedido",
  robots: { index: false },
}

export const dynamicParams = false

export function generateStaticParams() {
  return kinds.map((status) => ({ status }))
}

export default async function OrderStatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params
  if (!kinds.includes(status as ResultKind)) notFound()

  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <Suspense fallback={null}>
          <OrderResult kind={status as ResultKind} />
        </Suspense>
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  )
}
