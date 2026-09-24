import Link from "next/link"
import { Percent, Plus, Ticket, TicketX, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import { CouponActions } from "@/components/admin/coupon-actions"
import { listCoupons, getCouponStats } from "@/lib/coupons"
import { formatBRL } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function AdminCouponsPage() {
  const [coupons, stats] = await Promise.all([listCoupons(), getCouponStats()])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Cupons</h1>
          <p className="text-sm text-zinc-400">Crie cupons de desconto para seus clientes.</p>
        </div>
        <Link
          href="/admin/cupons/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="size-4" />
          Criar cupom
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Ticket} label="Cupons ativos" value={String(stats.activeCoupons)} tone="green" />
        <StatCard icon={TicketX} label="Cupons utilizados" value={String(stats.totalRedemptions)} tone="indigo" />
        <StatCard icon={TrendingUp} label="Valor convertido" value={formatBRL(stats.convertedValue)} tone="blue" />
        <StatCard icon={Percent} label="Valor descontado" value={formatBRL(stats.discountedValue)} tone="amber" />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                <th className="p-4 font-medium">Cupom</th>
                <th className="p-4 font-medium">Desconto</th>
                <th className="p-4 font-medium">Expira em</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Usos</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center gap-2 py-16 text-center">
                      <Ticket className="size-6 text-zinc-600" />
                      <p className="text-sm text-zinc-400">Nenhum cupom criado ainda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const expired = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() < Date.now() : false
                  const usedUp = coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit
                  const status = !coupon.active ? "Inativo" : expired ? "Expirado" : usedUp ? "Esgotado" : "Ativo"
                  const statusClass =
                    status === "Ativo"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : status === "Expirado" || status === "Esgotado"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-zinc-700/40 text-zinc-400"
                  return (
                    <tr key={coupon.id} className="border-b border-zinc-800/60 last:border-0">
                      <td className="p-4 font-mono font-medium text-white">{coupon.code}</td>
                      <td className="p-4 text-zinc-300">
                        {coupon.type === "percentage" ? `${coupon.value}%` : formatBRL(coupon.value)}
                        {coupon.minOrderValue > 0 && (
                          <p className="text-xs text-zinc-500">mín. {formatBRL(coupon.minOrderValue)}</p>
                        )}
                      </td>
                      <td className="p-4 text-zinc-300">
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR")
                          : "Nunca"}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>{status}</span>
                      </td>
                      <td className="p-4 text-zinc-300">
                        {coupon.usedCount}
                        {coupon.usageLimit != null && <span className="text-zinc-500"> / {coupon.usageLimit}</span>}
                      </td>
                      <td className="p-4">
                        <CouponActions code={coupon.code} active={coupon.active} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-800 p-4 text-sm text-zinc-500">
          Total de {coupons.length} {coupons.length === 1 ? "cupom" : "cupons"}
        </div>
      </div>
    </div>
  )
}
