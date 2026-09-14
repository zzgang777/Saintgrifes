import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProductForm } from "@/components/admin/product-form"
import { getCategories } from "@/lib/products"

export default async function NovoProdutoPage() {
  const categories = (await getCategories()).filter((c) => c.key !== "novidades")

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link href="/admin/produtos" className="inline-flex w-fit items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="size-4" />
        Voltar para produtos
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-white">Novo produto</h1>
        <p className="text-sm text-zinc-400">Preencha os dados para adicionar um produto ao catálogo.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
