import { NextResponse } from "next/server"
import { decrementStock } from "@/lib/inventory"
import { incrementCouponUsage } from "@/lib/coupons"
import { sendOrderConfirmationEmail, sendAdminOrderNotifications } from "@/lib/email"
import { getPayment, verifyWebhookSignature, type MpPaymentStatus } from "@/lib/mercadopago"
import { getOrderById, updateOrderStatus, type OrderStatus } from "@/lib/orders"

// O Mercado Pago manda o aviso no formato ?data.id=...&type=payment na própria URL, mesmo quando o
// corpo já traz "data.id" também — usamos o da URL, que é o que entra na conta da assinatura.
function statusFor(mpStatus: MpPaymentStatus): OrderStatus | null {
  if (mpStatus === "approved") return "paid"
  if (mpStatus === "rejected" || mpStatus === "cancelled") return "failed"
  if (mpStatus === "refunded" || mpStatus === "charged_back") return "cancelled"
  return null // pending / in_process: ainda não aconteceu nada pra mudar
}

async function markPaid(orderId: string, paymentId: string) {
  const result = await updateOrderStatus(orderId, "paid", paymentId)
  if (!("changed" in result) || !result.changed) return
  if (result.items) await decrementStock(result.items)
  if (result.couponCode) await incrementCouponUsage(result.couponCode)

  const order = await getOrderById(orderId)
  if (order) {
    await sendOrderConfirmationEmail(order)
    await sendAdminOrderNotifications(order, "paid")
  }
}

export async function POST(request: Request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 })

  const url = new URL(request.url)
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id")
  const type = url.searchParams.get("type")

  // Garante que o corpo é lido (a Mercado Pago espera 200 rápido), mesmo que a gente não use o
  // conteúdo dele — o que importa de verdade vem de uma consulta direta à API logo abaixo.
  await request.text().catch(() => "")

  if (!dataId || type !== "payment") return NextResponse.json({ received: true })

  const signatureOk = await verifyWebhookSignature(dataId, request.headers.get("x-request-id"), request.headers.get("x-signature"), secret)
  if (!signatureOk) return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 })

  const payment = await getPayment(dataId)
  if (!payment || !payment.externalReference) return NextResponse.json({ received: true })

  const status = statusFor(payment.status)
  if (!status) return NextResponse.json({ received: true })

  if (status === "paid") {
    await markPaid(payment.externalReference, payment.id)
  } else {
    await updateOrderStatus(payment.externalReference, status, payment.id)
  }

  return NextResponse.json({ received: true })
}
