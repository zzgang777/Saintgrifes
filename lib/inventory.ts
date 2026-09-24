import { supabaseAdmin } from "@/lib/supabase"
import type { OrderLine } from "@/lib/checkout"

// Tira do estoque as unidades de um pedido que acabou de ser pago. Roda uma vez por pedido
// (updateOrderStatus só avisa "changed" na primeira vez que o status vira "paid"). Nunca deixa o
// estoque negativo, mesmo que duas compras concorrentes disputem a última unidade.
export async function decrementStock(items: OrderLine[]) {
  if (!supabaseAdmin || items.length === 0) return

  for (const item of items) {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("stock")
      .eq("slug", item.slug)
      .maybeSingle()
    if (error || !product) continue

    const stock = { ...(product.stock as Record<string, number> | null) }
    const current = Math.max(0, Math.trunc(Number(stock[item.size]) || 0))
    stock[item.size] = Math.max(0, current - item.quantity)

    await supabaseAdmin.from("products").update({ stock }).eq("slug", item.slug)
  }
}
