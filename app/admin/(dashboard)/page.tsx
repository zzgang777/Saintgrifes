import Image from "next/image"
import Link from "next/link"
import { Package, Grid3x3, MessageCircle, Sparkles } from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import { getProducts, getCategories } from "@/lib/products"
import { formatBRL } from "@/lib/format"

export default async function AdminDashboardPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const totalProdutos = products.length
  const totalCategorias = categories.filter((c) => c.key !== "novidades").length
  const sobConsulta = products.filter((p) => p.onRequest).length
  const emDestaque = products.filter((p) => p.isNew || p.bestSeller).length

  const porCategoria = categories
    .filter((c) => c.key !== "novidades")
    .map((c) => ({
      label: c.label,
      count: products.filter((p) => p.category === c.key).length,
    }))
  const maxCount = Math.max(...porCategoria.map((c) => c.count), 1)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400">Visão geral do catálogo da Estilo da Ilha.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Produtos cadastrados" value={String(totalProdutos)} />
        <StatCard icon={Grid3x3} label="Categorias" value={String(totalCategorias)} />
        <StatCard icon={Sparkles} label="Em destaque / novidades" value={String(emDestaque)} />
        <StatCard icon={MessageCircle} label="Sob consulta (kits)" value={String(sobConsulta)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-800 p-5">
            <h2 className="font-medium text-white">Produtos</h2>
            <Link href="/admin/produtos" className="text-sm text-red-500 hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-zinc-800">
            {products.slice(0, 6).map((p) => (
              <li key={p.slug} className="flex items-center gap-3 p-4">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="44px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.categoryLabel}</p>
                </div>
                <span className="text-sm font-medium text-white">
                  {p.onRequest ? "Sob consulta" : formatBRL(p.salePrice ?? p.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 font-medium text-white">Produtos por categoria</h2>
          <div className="flex flex-col gap-3">
            {porCategoria.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{c.label}</span>
                  <span className="text-zinc-500">{c.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-red-600"
                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="font-medium text-zinc-300">Pedidos e vendas</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
          Hoje o checkout é feito direto pelo WhatsApp, então não há pedidos registrados aqui. Para acompanhar vendas
          neste painel, é preciso conectar um sistema de pedidos.
        </p>
      </div>
    </div>
  )
}
