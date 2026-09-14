import { getCategories } from "@/lib/products"
import { CategoriesGrid } from "@/components/categories-grid"

export async function CategoriesSection() {
  const categories = await getCategories()

  return (
    <section id="categorias" className="relative overflow-hidden bg-primary py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-md font-display text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-5xl text-balance">
            Compre por categoria
          </h2>
          <p className="max-w-xs text-white/70 text-pretty sm:text-right">
            De tênis a camisas: encontre a peça certa para o clima da ilha.
          </p>
        </div>

        <CategoriesGrid categories={categories} />
      </div>
    </section>
  )
}
