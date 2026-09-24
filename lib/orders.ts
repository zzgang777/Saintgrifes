import { supabaseAdmin } from "@/lib/supabase"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Address, OrderLine, PricedOrder } from "@/lib/checkout"

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled"

export type Order = {
  id: string
  createdAt: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCpf: string | null
  shippingService: string
  shippingDays: string | null
  shippingAddress: Address | null
  items: OrderLine[]
  subtotal: number
  shippingCost: number
  couponCode: string | null
  discount: number
  total: number
  paymentProvider: string | null
  paymentId: string | null
  paidAt: string | null
}

type OrderRow = {
  id: string
  created_at: string
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string | null
  shipping_service: string
  shipping_days: string | null
  shipping_address: Address | null
  items: OrderLine[]
  subtotal: number | string
  shipping_cost: number | string
  coupon_code: string | null
  discount: number | string
  total: number | string
  payment_provider: string | null
  payment_id: string | null
  paid_at: string | null
}

const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  createdAt: row.created_at,
  status: row.status,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  customerCpf: row.customer_cpf,
  shippingService: row.shipping_service,
  shippingDays: row.shipping_days,
  shippingAddress: row.shipping_address,
  items: row.items,
  subtotal: Number(row.subtotal),
  shippingCost: Number(row.shipping_cost),
  couponCode: row.coupon_code,
  discount: Number(row.discount),
  total: Number(row.total),
  paymentProvider: row.payment_provider,
  paymentId: row.payment_id,
  paidAt: row.paid_at,
})

// userId é opcional: quem finaliza a compra sem estar logado continua conseguindo comprar
// normalmente, só não vê o pedido depois em "Minha conta".
export async function insertOrder(order: PricedOrder, userId?: string | null): Promise<{ id: string } | { error: string }> {
  if (!supabaseAdmin) return { error: "Banco de dados não configurado." }
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId ?? null,
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      shipping_service: order.shipping.label,
      shipping_days: order.shipping.days,
      shipping_address: order.address,
      items: order.lines,
      subtotal: order.subtotal,
      shipping_cost: order.shippingCost,
      coupon_code: order.couponCode,
      discount: order.discount,
      total: order.total,
    })
    .select("id")
    .single()
  if (error || !data) return { error: error?.message ?? "Não foi possível registrar o pedido." }
  return { id: data.id as string }
}

// Pedidos da conta logada, pra tela "Minha conta". Usa o cliente com a sessão do próprio cliente
// (não o de administrador) — o banco só libera as linhas que pertencem a essa conta.
export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as OrderRow[]).map(mapOrder)
}

export async function attachPayment(id: string, payment: { provider: string; paymentId?: string; url?: string }) {
  if (!supabaseAdmin) return
  await supabaseAdmin
    .from("orders")
    .update({ payment_provider: payment.provider, payment_id: payment.paymentId ?? null, payment_url: payment.url ?? null })
    .eq("id", id)
}

// Devolve "changed: true" só quando o status realmente virou "paid" nesta chamada (não estava
// pago antes) — é o sinal pra baixar o estoque uma única vez, mesmo que o Mercado Pago reenvie o aviso.
export async function updateOrderStatus(id: string, status: OrderStatus, paymentId?: string) {
  if (!supabaseAdmin) return { error: "Banco de dados não configurado." }
  const update: Record<string, unknown> = { status }
  if (paymentId) update.payment_id = paymentId
  if (status === "paid") update.paid_at = new Date().toISOString()
  let query = supabaseAdmin.from("orders").update(update).eq("id", id)
  if (status !== "paid") query = query.neq("status", "paid")
  const { data, error } = await query.select("id, items, coupon_code")
  if (error) return { error: error.message }
  const changed = status === "paid" && (data?.length ?? 0) > 0
  return {
    ok: true as const,
    changed,
    items: changed ? (data![0].items as OrderLine[]) : undefined,
    couponCode: changed ? (data![0].coupon_code as string | null) : undefined,
  }
}

export async function getOrderStatus(id: string): Promise<OrderStatus | null> {
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin.from("orders").select("status").eq("id", id).maybeSingle()
  return (data?.status as OrderStatus | undefined) ?? null
}

// Pedido completo (pra montar o e-mail de confirmação, por exemplo).
export async function getOrderById(id: string): Promise<Order | null> {
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin.from("orders").select("*").eq("id", id).maybeSingle()
  return data ? mapOrder(data as OrderRow) : null
}

export async function listOrders(limit = 200): Promise<{ orders: Order[]; unavailable?: boolean }> {
  if (!supabaseAdmin) return { orders: [], unavailable: true }
  const { data, error } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(limit)
  if (error || !data) return { orders: [], unavailable: true }
  return { orders: (data as OrderRow[]).map(mapOrder) }
}
