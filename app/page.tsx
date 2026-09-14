import { CartProvider } from "@/components/cart-provider"
import { AnimatedBackground } from "@/components/animated-background"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { CategoriesSection } from "@/components/categories-section"
import { ExclusiveBanner } from "@/components/exclusive-banner"
import { ProductShowcase } from "@/components/product-showcase"
import { AboutSection } from "@/components/about-section"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import { WhatsappFloat } from "@/components/whatsapp-float"
import { getProducts } from "@/lib/products"

export default async function HomePage() {
  const products = await getProducts()

  return (
    <CartProvider>
      <AnimatedBackground />
      <SiteHeader />
      <main>
        <Hero />
        <CategoriesSection />
        <ExclusiveBanner />
        <ProductShowcase products={products} />
        <AboutSection />
      </main>
      <SiteFooter />
      <CartDrawer />
      <WhatsappFloat />
    </CartProvider>
  )
}
