import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { ProductForm } from "@/components/admin/product-form"
import { getProduct, getCategories } from "@/lib/products"

export default async function EditarProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, categories] = await Promise.all([getProduct(slug), getCategories()])
  if (!product) notFound()

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link href="/admin/produtos" className="inline-flex w-fit items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="size-4" />
        Voltar para produtos
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-white">Editar produto</h1>
        <p className="text-sm text-zinc-400">{product.name}</p>
      </div>
      <ProductForm product={product} categories={categories.filter((c) => c.key !== "novidades")} />
    </div>
  )
}
