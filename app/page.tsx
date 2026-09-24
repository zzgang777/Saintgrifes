import { Suspense } from "react"
import { CartProvider } from "@/components/cart-provider"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { CategoriesSection } from "@/components/categories-section"
import { DeliveryBanner } from "@/components/delivery-banner"
import { ProductShowcase } from "@/components/product-showcase"
import { SectionSkeleton } from "@/components/section-skeleton"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import { InstagramFloat } from "@/components/instagram-float"
import { getProducts } from "@/lib/products"

async function Showcase() {
  const products = await getProducts()
  return <ProductShowcase products={products} />
}

export default function HomePage() {
  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <Hero />
        <Suspense fallback={<SectionSkeleton tiles={4} />}>
          <CategoriesSection />
        </Suspense>
        <DeliveryBanner />
        <Suspense fallback={<SectionSkeleton tiles={8} />}>
          <Showcase />
        </Suspense>
      </main>
      <SiteFooter />
      <CartDrawer />
      <InstagramFloat />
    </CartProvider>
  )
}
