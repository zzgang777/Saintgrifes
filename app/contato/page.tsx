import type { Metadata } from "next"
import { CartProvider } from "@/components/cart-provider"
import { AnimatedBackground } from "@/components/animated-background"
import { SiteHeader } from "@/components/site-header"
import { StoreSection } from "@/components/store-section"
import { WhatsappSection } from "@/components/whatsapp-section"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import { WhatsappFloat } from "@/components/whatsapp-float"

export const metadata: Metadata = {
  title: "Contato",
  description: "Endereço, horário de funcionamento e WhatsApp da Estilo da Ilha em São Luís - MA.",
}

export default function ContatoPage() {
  return (
    <CartProvider>
      <AnimatedBackground />
      <SiteHeader />
      <main className="py-10">
        <StoreSection />
        <WhatsappSection />
      </main>
      <SiteFooter />
      <CartDrawer />
      <WhatsappFloat />
    </CartProvider>
  )
}
