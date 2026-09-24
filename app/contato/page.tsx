import type { Metadata } from "next"
import { CartProvider } from "@/components/cart-provider"
import { SiteHeader } from "@/components/site-header"
import { InstagramCta } from "@/components/instagram-cta"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import { InstagramFloat } from "@/components/instagram-float"

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Saint Grifes pelo Instagram.",
}

export default function ContatoPage() {
  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <InstagramCta />
      </main>
      <SiteFooter />
      <CartDrawer />
      <InstagramFloat />
    </CartProvider>
  )
}
