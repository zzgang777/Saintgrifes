import type { PricedOrder } from "@/lib/checkout"

const API = "https://api.mercadopago.com"

export const isPaymentsConfigured = () => Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN)

// Cria a "preferência" de pagamento (Checkout Pro): a página onde o cliente escolhe Pix, cartão ou
// boleto e paga. Com um token de teste (começa com "TEST-"), o link de pagamento é o do sandbox;
// com o token de produção ("APP_USR-..."), é o link real.
export async function createPreference(orderId: string, order: PricedOrder, siteUrl: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN!

  const items = order.lines.map((line) => ({
    title: `${line.name} (${line.size})`,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    currency_id: "BRL",
  }))
  if (order.shippingCost > 0) {
    items.push({ title: order.shipping.label, quantity: 1, unit_price: order.shippingCost, currency_id: "BRL" })
  }

  const body = {
    items,
    payer: { name: order.customer.name, email: order.customer.email },
    back_urls: {
      success: `${siteUrl}/pedido/sucesso?external_reference=${orderId}`,
      failure: `${siteUrl}/pedido/recusado?external_reference=${orderId}`,
      pending: `${siteUrl}/pedido/pendente?external_reference=${orderId}`,
    },
    auto_return: "approved",
    external_reference: orderId,
    notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    statement_descriptor: "SAINT GRIFES",
  }

  const res = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.id) {
    return { error: (data.message as string | undefined) ?? "O Mercado Pago recusou a criação do pagamento." }
  }
  const url = token.startsWith("TEST-") ? data.sandbox_init_point : data.init_point
  return { id: data.id as string, url: (url ?? data.init_point) as string }
}

export type MpPaymentStatus = "approved" | "pending" | "in_process" | "rejected" | "cancelled" | "refunded" | "charged_back"

// Busca o pagamento na API pra confirmar de verdade o que aconteceu — nunca confiamos só no
// conteúdo do aviso (webhook), que é só um "algo mudou, vem conferir".
export async function getPayment(paymentId: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) return null
  const res = await fetch(`${API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  if (!data) return null
  return {
    id: String(data.id),
    status: data.status as MpPaymentStatus,
    externalReference: data.external_reference as string | null,
  }
}

const encoder = new TextEncoder()

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Confere que o aviso veio mesmo do Mercado Pago. O cabeçalho "x-signature" traz um horário (ts) e
// uma assinatura (v1) feita com a chave secreta do webhook sobre "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
export async function verifyWebhookSignature(dataId: string, requestId: string | null, signatureHeader: string | null, secret: string) {
  if (!signatureHeader || !requestId || !secret) return false
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.trim().split("=").map((s) => s.trim())) as [string, string][],
  )
  const ts = parts.ts
  const hash = parts.v1
  if (!ts || !hash) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest))
  const expected = Array.from(new Uint8Array(signed), (b) => b.toString(16).padStart(2, "0")).join("")
  return safeEqual(hash, expected)
}
