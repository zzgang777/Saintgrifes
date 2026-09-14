import Image from "next/image"
import Link from "next/link"
import { Pencil, Plus } from "lucide-react"
import { getProducts } from "@/lib/products"
import { formatBRL } from "@/lib/format"
import { isSupabaseConfigured } from "@/lib/supabase"
import { DeleteProductButton } from "@/components/admin/delete-product-button"

export default async function AdminProdutosPage() {
  const products = await getProducts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Produtos</h1>
          <p className="text-sm text-zinc-400">{products.length} produtos cadastrados no catálogo.</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Plus className="size-4" />
          Novo produto
        </Link>
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          O banco de dados ainda não foi conectado — esta lista mostra os dados padrão do site. Criar, editar e
          remover produtos só funciona depois de configurar o Supabase (veja <code className="text-zinc-300">.env.example</code>).
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-4 font-medium">Produto</th>
              <th className="p-4 font-medium">Categoria</th>
              <th className="p-4 font-medium">Preço</th>
              <th className="p-4 font-medium">Tamanhos</th>
              <th className="p-4 font-medium">Badge</th>
              <th className="p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((p) => (
              <tr key={p.slug} className="hover:bg-zinc-800/50">
                <td className="flex items-center gap-3 p-4">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                    <Image src={p.image} alt={p.name} fill className="object-cover" sizes="44px" />
                  </div>
                  <span className="font-medium text-white">{p.name}</span>
                </td>
                <td className="p-4 text-zinc-300">{p.categoryLabel}</td>
                <td className="p-4 text-zinc-300">
                  {p.onRequest ? (
                    <span className="text-zinc-500">Sob consulta</span>
                  ) : (
                    <>
                      {formatBRL(p.salePrice ?? p.price)}
                      {p.salePrice && (
                        <span className="ml-2 text-xs text-zinc-500 line-through">{formatBRL(p.price)}</span>
                      )}
                    </>
                  )}
                </td>
                <td className="p-4 text-zinc-300">{p.sizes.join(", ")}</td>
                <td className="p-4">
                  {p.badge && (
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        p.badge === "OFERTA" ? "bg-red-600/15 text-red-500" : "bg-zinc-700/50 text-zinc-300"
                      }`}
                    >
                      {p.badge}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/produtos/${p.slug}/editar`}
                      aria-label={`Editar ${p.name}`}
                      className="text-zinc-400 transition-colors hover:text-white"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteProductButton slug={p.slug} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
