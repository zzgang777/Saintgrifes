import { NextResponse } from "next/server"
import { resolveItems } from "@/lib/checkout"
import { getProducts } from "@/lib/products"
import { quoteShipping } from "@/lib/shipping"

// Cotação de frete para o checkout: recebe o CEP e os itens do carrinho e devolve as opções
// (entrega no mesmo dia em São Luís ou Correios). O valor final é recotado de novo no pagamento.
export async function POST(request: Request) {
  let body: { cep?: unknown; items?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 })
  }

  const items = resolveItems(body.items, await getProducts())
  if (!items.ok) return NextResponse.json({ error: items.error }, { status: 400 })

  const result = await quoteShipping(typeof body.cep === "string" ? body.cep : "", items.value.quoteLines)
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
}
