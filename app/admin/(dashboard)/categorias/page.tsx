import Image from "next/image"
import { getCategories, getProducts } from "@/lib/products"

export default async function AdminCategoriasPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Categorias</h1>
        <p className="text-sm text-zinc-400">Categorias exibidas na loja e quantos produtos cada uma tem.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat.key).length
          return (
            <div key={cat.key} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="relative aspect-video">
                <Image src={cat.image} alt={cat.label} fill className="object-cover" sizes="300px" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-white">{cat.label}</h2>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                    {cat.key === "novidades" ? "automática" : `${count} produtos`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
