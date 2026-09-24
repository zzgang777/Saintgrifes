import { NextResponse } from "next/server"
import { getOrderStatus } from "@/lib/orders"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Só devolve a situação do pedido (pendente, pago...). O número do pedido é um UUID impossível de
// adivinhar e nenhum dado do cliente é exposto.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: "Pedido inválido." }, { status: 400 })
  const status = await getOrderStatus(id)
  if (!status) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  return NextResponse.json({ status }, { headers: { "Cache-Control": "no-store" } })
}
