import type { Metadata } from "next"
import { CartProvider } from "@/components/cart-provider"
import { SiteHeader } from "@/components/site-header"
import { CheckoutForm } from "@/components/checkout-form"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import { getCurrentUser } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
}

export default async function CheckoutPage() {
  const user = await getCurrentUser()
  const initialName = (user?.user_metadata?.name as string | undefined) ?? ""
  const initialEmail = user?.email ?? ""

  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <CheckoutForm initialName={initialName} initialEmail={initialEmail} />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  )
}
