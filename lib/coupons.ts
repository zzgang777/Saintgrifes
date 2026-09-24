import { supabaseAdmin } from "@/lib/supabase"
import { formatBRL } from "@/lib/format"

export type CouponType = "fixed" | "percentage"

export type Coupon = {
  id: string
  code: string
  type: CouponType
  value: number
  minOrderValue: number
  usageLimit: number | null
  usedCount: number
  expiresAt: string | null
  active: boolean
  createdAt: string
}

type CouponRow = {
  id: string
  code: string
  type: CouponType
  value: number | string
  min_order_value: number | string
  usage_limit: number | null
  used_count: number
  expires_at: string | null
  active: boolean
  created_at: string
}

const mapCoupon = (row: CouponRow): Coupon => ({
  id: row.id,
  code: row.code,
  type: row.type,
  value: Number(row.value),
  minOrderValue: Number(row.min_order_value),
  usageLimit: row.usage_limit,
  usedCount: row.used_count,
  expiresAt: row.expires_at,
  active: row.active,
  createdAt: row.created_at,
})

const cents = (value: number) => Math.round(value * 100) / 100

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  const raw = coupon.type === "percentage" ? subtotal * (coupon.value / 100) : coupon.value
  return cents(Math.min(Math.max(raw, 0), subtotal))
}

export type CouponValidation = { ok: true; code: string; discount: number } | { ok: false; error: string }

// Confere o cupom de verdade contra o banco — nunca confia num valor de desconto vindo do
// navegador. Usada tanto no botão "Aplicar" do checkout quanto na hora de criar o pedido.
export async function validateCoupon(codeInput: string, subtotal: number): Promise<CouponValidation> {
  const code = codeInput.trim().toUpperCase()
  if (!code) return { ok: false, error: "Informe um cupom." }
  if (!supabaseAdmin) return { ok: false, error: "Cupom indisponível no momento." }

  const { data, error } = await supabaseAdmin.from("coupons").select("*").eq("code", code).maybeSingle()
  if (error || !data) return { ok: false, error: "Cupom não encontrado." }

  const coupon = mapCoupon(data as CouponRow)
  if (!coupon.active) return { ok: false, error: "Esse cupom não está mais ativo." }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) return { ok: false, error: "Esse cupom expirou." }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: "Esse cupom já atingiu o limite de usos." }
  }
  if (subtotal < coupon.minOrderValue) {
    return { ok: false, error: `Esse cupom vale a partir de ${formatBRL(coupon.minOrderValue)} em produtos.` }
  }

  return { ok: true, code: coupon.code, discount: calculateDiscount(coupon, subtotal) }
}

// Soma 1 no contador de usos — chamado só quando o pedido é realmente pago (não em toda tentativa
// de compra), pra não gastar o limite do cupom com carrinho abandonado.
export async function incrementCouponUsage(code: string) {
  if (!supabaseAdmin) return
  const { data } = await supabaseAdmin.from("coupons").select("used_count").eq("code", code.toUpperCase()).maybeSingle()
  if (!data) return
  await supabaseAdmin.from("coupons").update({ used_count: Number(data.used_count) + 1 }).eq("code", code.toUpperCase())
}

// --- Admin ---

export type CouponStats = {
  activeCoupons: number
  totalRedemptions: number
  convertedValue: number
  discountedValue: number
}

// Números pro topo da tela de cupons: quantos estão ativos, quantas vezes já foram usados, e
// quanto isso gerou em vendas pagas (com o desconto já aplicado).
export async function getCouponStats(): Promise<CouponStats> {
  if (!supabaseAdmin) return { activeCoupons: 0, totalRedemptions: 0, convertedValue: 0, discountedValue: 0 }

  const [couponsRes, ordersRes] = await Promise.all([
    supabaseAdmin.from("coupons").select("active, used_count"),
    supabaseAdmin.from("orders").select("total, discount").eq("status", "paid").not("coupon_code", "is", null),
  ])

  const coupons = couponsRes.data ?? []
  const orders = ordersRes.data ?? []

  return {
    activeCoupons: coupons.filter((c) => c.active).length,
    totalRedemptions: coupons.reduce((sum, c) => sum + Number(c.used_count), 0),
    convertedValue: orders.reduce((sum, o) => sum + Number(o.total), 0),
    discountedValue: orders.reduce((sum, o) => sum + Number(o.discount), 0),
  }
}

export async function listCoupons(): Promise<Coupon[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as CouponRow[]).map(mapCoupon)
}

export type NewCoupon = {
  code: string
  type: CouponType
  value: number
  minOrderValue: number
  usageLimit: number | null
  expiresAt: string | null
}

export async function createCoupon(input: NewCoupon): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabaseAdmin) return { ok: false, error: "Banco de dados não configurado." }
  const code = input.code.trim().toUpperCase()
  if (!code) return { ok: false, error: "Informe o código do cupom." }
  if (!Number.isFinite(input.value) || input.value <= 0) return { ok: false, error: "Informe um valor de desconto válido." }

  const { error } = await supabaseAdmin.from("coupons").insert({
    code,
    type: input.type,
    value: input.value,
    min_order_value: input.minOrderValue || 0,
    usage_limit: input.usageLimit,
    expires_at: input.expiresAt,
  })
  if (error) return { ok: false, error: error.code === "23505" ? "Já existe um cupom com esse código." : error.message }
  return { ok: true }
}

export async function setCouponActive(code: string, active: boolean) {
  if (!supabaseAdmin) return
  await supabaseAdmin.from("coupons").update({ active }).eq("code", code.toUpperCase())
}

export async function deleteCoupon(code: string) {
  if (!supabaseAdmin) return
  await supabaseAdmin.from("coupons").delete().eq("code", code.toUpperCase())
}
