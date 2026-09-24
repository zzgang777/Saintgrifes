import { getCategories } from "@/lib/products"
import { CategoriesGrid } from "@/components/categories-grid"
import { GlitchTitle } from "@/components/glitch-title"

export async function CategoriesSection() {
  const categories = await getCategories()

  return (
    <section id="categorias" className="border-y border-border bg-black/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <GlitchTitle className="max-w-md font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-5xl text-balance">Compre por categoria</GlitchTitle>
          <p className="max-w-xs text-bone/80 text-pretty sm:text-right">
            De camisas a bermudas: ache a peça certa pro seu rolê.
          </p>
        </div>

        <CategoriesGrid categories={categories} />
      </div>
    </section>
  )
}
