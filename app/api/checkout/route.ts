import { NextResponse } from "next/server"
import { priceOrder } from "@/lib/checkout"
import { quoteShipping } from "@/lib/shipping"
import { validateCoupon } from "@/lib/coupons"
import { attachPayment, getOrderById, insertOrder, updateOrderStatus } from "@/lib/orders"
import { createPreference, isPaymentsConfigured } from "@/lib/mercadopago"
import { getProducts } from "@/lib/products"
import { getSiteUrl } from "@/lib/site-url"
import { getCurrentUser } from "@/lib/supabase/server"
import { sendAdminOrderNotifications } from "@/lib/email"

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

export async function POST(request: Request) {
  if (!isPaymentsConfigured()) {
    return fail("O pagamento online está indisponível no momento. Tente de novo em instantes ou fale com a gente no Instagram.", 503)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail("Requisição inválida.", 400)
  }

  // Os valores e o frete são recalculados aqui, com os preços do banco e uma nova cotação; o que o navegador mandar é ignorado.
  const priced = await priceOrder(body, await getProducts(), quoteShipping, validateCoupon)
  if (!priced.ok) return fail(priced.error, 400)

  const user = await getCurrentUser()
  const created = await insertOrder(priced.value, user?.id)
  if ("error" in created) {
    return fail("Não foi possível registrar o pedido agora. Tente de novo ou fale com a gente no Instagram.", 503)
  }

  const createdOrder = await getOrderById(created.id)
  if (createdOrder) await sendAdminOrderNotifications(createdOrder, "created")

  const preference = await createPreference(created.id, priced.value, getSiteUrl())
  if ("error" in preference) {
    await updateOrderStatus(created.id, "failed")
    return fail("Não foi possível iniciar o pagamento. Tente de novo ou fale com a gente no Instagram.", 502)
  }

  await attachPayment(created.id, { provider: "mercadopago", paymentId: preference.id, url: preference.url })
  return NextResponse.json({ url: preference.url, orderId: created.id })
}
