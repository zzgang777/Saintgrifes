import Image from "next/image"
import Link from "next/link"
import {
  Ban,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  Package,
  Plus,
  TrendingUp,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import { PeriodSelect } from "@/components/admin/period-select"
import { SalesChart } from "@/components/admin/sales-chart"
import { getDashboardStats } from "@/lib/dashboard"
import { parsePeriod } from "@/lib/periods"
import { getCategories, getProducts } from "@/lib/products"
import { formatBRL } from "@/lib/format"

export const dynamic = "force-dynamic"

const quickActions = [
  { href: "/admin/produtos/novo", label: "Novo produto", hint: "Adicionar produto ao catálogo", icon: Plus },
  { href: "/admin/pedidos", label: "Ver pedidos", hint: "Acompanhar pedidos e pagamentos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Ver produtos", hint: "Editar preços e tamanhos", icon: Package },
]

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { dias } = await searchParams
  const days = parsePeriod(dias)

  const [stats, products, categories] = await Promise.all([getDashboardStats(days), getProducts(), getCategories()])

  const porCategoria = categories
    .filter((c) => c.key !== "novidades")
    .map((c) => ({ label: c.label, count: products.filter((p) => p.category === c.key).length }))
  const maxCount = Math.max(...porCategoria.map((c) => c.count), 1)
  const emDestaque = products.filter((p) => p.isNew || p.bestSeller).length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Bem-vindo, Administrador!</h1>
          <p className="mt-1 text-sm text-zinc-400">Aqui está um resumo completo da sua loja.</p>
        </div>
        <PeriodSelect value={days} />
      </div>

      {stats.unavailable && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          Não foi possível ler os pedidos agora, então os números abaixo aparecem zerados. Confira se o projeto do Supabase
          está ativo e se a tabela <code>orders</code> foi criada (arquivo <code>supabase/orders.sql</code>).
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={DollarSign}
          tone="green"
          label="Faturamento"
          value={formatBRL(stats.revenue)}
          hint={`${stats.paidOrders} ${stats.paidOrders === 1 ? "pedido pago" : "pedidos pagos"}`}
        />
        <StatCard icon={WalletCards} tone="purple" label="Ticket médio" value={formatBRL(stats.averageTicket)} hint="por pedido pago" />
        <StatCard icon={Users} tone="blue" label="Clientes que compraram" value={String(stats.customers)} hint="no período selecionado" />
        <StatCard
          icon={TrendingUp}
          tone="pink"
          label="Conversão de pedidos"
          value={`${stats.conversion.toFixed(1)}%`}
          hint={`${stats.paidOrders} pagos de ${stats.createdOrders} pedidos`}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Status dos pedidos <span className="text-sm font-normal text-zinc-500">(no período selecionado)</span>
        </h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={Clock} tone="amber" label="Pendentes" value={String(stats.status.pending.count)} hint={formatBRL(stats.status.pending.total)} />
          <StatCard icon={CheckCircle2} tone="green" label="Pagos" value={String(stats.status.paid.count)} hint={formatBRL(stats.status.paid.total)} />
          <StatCard icon={XCircle} tone="red" label="Recusados" value={String(stats.status.failed.count)} hint={formatBRL(stats.status.failed.total)} />
          <StatCard icon={Ban} tone="slate" label="Cancelados" value={String(stats.status.cancelled.count)} hint={formatBRL(stats.status.cancelled.total)} />
        </div>
      </section>

      <SalesChart points={stats.series} changePercent={stats.changePercent} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Ações rápidas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map(({ href, label, hint, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-dashed border-zinc-700 p-5 transition-colors hover:border-indigo-400/60 hover:bg-indigo-500/5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 transition-colors group-hover:bg-indigo-500/25">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-medium text-white">{label}</span>
                <span className="block text-sm text-zinc-500">{hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Catálogo <span className="text-sm font-normal text-zinc-500">({products.length} produtos, {emDestaque} em destaque)</span>
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800 p-5">
              <h3 className="font-medium text-white">Produtos</h3>
              <Link href="/admin/produtos" className="text-sm text-indigo-400 hover:underline">
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

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <h3 className="mb-4 font-medium text-white">Produtos por categoria</h3>
            <div className="flex flex-col gap-3">
              {porCategoria.map((c) => (
                <div key={c.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{c.label}</span>
                    <span className="text-zinc-500">{c.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
