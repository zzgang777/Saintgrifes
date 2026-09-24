import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CartProvider } from "@/components/cart-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import { InstagramFloat } from "@/components/instagram-float"
import { ProductDetail } from "@/components/product-detail"
import { ProductCard } from "@/components/product-card"
import { getProduct, getRelated, getProducts } from "@/lib/products"
import { formatBRL } from "@/lib/format"

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Produto não encontrado" }

  const priceLabel = product.onRequest ? "Sob consulta" : formatBRL(product.salePrice ?? product.price)

  return {
    title: `${product.name} — ${priceLabel}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Saint Grifes`,
      description: product.description,
      images: [{ url: product.image, width: 800, height: 1067, alt: product.name }],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelated(product)

  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <ProductDetail product={product} />

        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="mb-8 font-display text-3xl uppercase tracking-tight sm:text-4xl">Você também vai gostar</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <CartDrawer />
      <InstagramFloat />
    </CartProvider>
  )
}
