import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartProvider } from "@/components/cart-provider"
import { CartDrawer } from "@/components/cart-drawer"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false },
}

export default function SignupPage() {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 lg:py-24">
        <h1 className="mb-8 font-display text-4xl uppercase tracking-tight sm:text-5xl">Criar conta</h1>
        <SignupForm />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  )
}
