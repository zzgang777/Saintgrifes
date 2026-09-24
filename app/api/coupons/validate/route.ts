import { NextResponse } from "next/server"
import { resolveItems } from "@/lib/checkout"
import { validateCoupon } from "@/lib/coupons"
import { getProducts } from "@/lib/products"

// Confere o cupom pro botão "Aplicar" do checkout. O desconto é recalculado de novo (e o cupom
// re-validado) na hora de criar o pedido de verdade — isso aqui é só pra mostrar na tela.
export async function POST(request: Request) {
  let body: { code?: unknown; items?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 })
  }

  const items = resolveItems(body.items, await getProducts())
  if (!items.ok) return NextResponse.json({ ok: false, error: items.error }, { status: 400 })

  const result = await validateCoupon(typeof body.code === "string" ? body.code : "", items.value.subtotal)
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
}
