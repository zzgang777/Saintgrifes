import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartProvider } from "@/components/cart-provider"
import { CartDrawer } from "@/components/cart-drawer"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 lg:py-24">
        <h1 className="mb-8 font-display text-4xl uppercase tracking-tight sm:text-5xl">Entrar</h1>
        <LoginForm />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  )
}
