import { PackageSearch } from "lucide-react"
import { formatBRL } from "@/lib/format"
import { listOrders, type OrderStatus } from "@/lib/orders"

export const dynamic = "force-dynamic"

const columns = ["Data", "Pedido", "Cliente", "Produtos", "Total", "Entrega", "Status"]

const statusStyle: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Aguardando", className: "bg-amber-500/15 text-amber-400" },
  paid: { label: "Pago", className: "bg-emerald-500/15 text-emerald-400" },
  failed: { label: "Recusado", className: "bg-red-500/15 text-red-400" },
  cancelled: { label: "Cancelado", className: "bg-zinc-700/40 text-zinc-400" },
}

export default async function AdminPedidosPage() {
  const { orders, unavailable } = await listOrders()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Pedidos</h1>
        <p className="text-sm text-zinc-400">Pedidos feitos pelo checkout online da loja.</p>
      </div>

      {unavailable && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          Não foi possível ler os pedidos agora. Confira se o projeto do Supabase está ativo e se a tabela{" "}
          <code>orders</code> foi criada (arquivo <code>supabase/orders.sql</code>).
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                {columns.map((col) => (
                  <th key={col} className="p-4 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="flex flex-col items-center gap-2 py-16 text-center">
                      <PackageSearch className="size-6 text-zinc-600" />
                      <p className="text-sm text-zinc-400">Nenhum pedido registrado ainda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = statusStyle[order.status]
                  const address = order.shippingAddress
                  return (
                    <tr key={order.id} className="border-b border-zinc-800/60 align-top last:border-0">
                      <td className="whitespace-nowrap p-4 text-zinc-400">
                        {new Date(order.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="p-4 font-mono text-xs text-zinc-300">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-4">
                        <p className="text-white">{order.customerName}</p>
                        <p className="text-xs text-zinc-500">{order.customerEmail}</p>
                        <p className="text-xs text-zinc-500">{order.customerPhone}</p>
                        <details className="mt-1 text-xs text-zinc-500">
                          <summary className="cursor-pointer text-zinc-400">Mais dados</summary>
                          {order.customerCpf && <p>CPF: {order.customerCpf}</p>}
                          {address && (
                            <p>
                              {address.street}, {address.number}
                              {address.complement ? ` — ${address.complement}` : ""}, {address.district}, {address.city}/
                              {address.state}, CEP {address.cep}
                            </p>
                          )}
                        </details>
                      </td>
                      <td className="p-4">
                        <ul className="flex flex-col gap-0.5 text-zinc-300">
                          {order.items.map((item) => (
                            <li key={`${item.slug}-${item.size}`}>
                              {item.quantity}x {item.name} <span className="text-zinc-500">({item.size})</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="whitespace-nowrap p-4 text-white">
                        {formatBRL(order.total)}
                        {order.shippingCost > 0 && (
                          <p className="text-xs text-zinc-500">inclui {formatBRL(order.shippingCost)} de entrega</p>
                        )}
                        {order.couponCode && (
                          <p className="text-xs text-emerald-400">
                            cupom {order.couponCode} (-{formatBRL(order.discount)})
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-zinc-300">
                        {order.shippingService}
                        {order.shippingDays && <p className="text-xs text-zinc-500">{order.shippingDays}</p>}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-800 p-4 text-sm text-zinc-500">
          Total de {orders.length} {orders.length === 1 ? "resultado" : "resultados"}
        </div>
      </div>
    </div>
  )
}
