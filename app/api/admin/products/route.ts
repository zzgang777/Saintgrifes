import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Banco de dados não configurado. Veja o arquivo .env.example." },
      { status: 503 },
    )
  }

  const body = await request.json()

  const { error } = await supabaseAdmin.from("products").insert({
    slug: body.slug,
    name: body.name,
    price: body.price,
    sale_price: body.salePrice ?? null,
    image: body.image,
    category: body.category,
    category_label: body.categoryLabel,
    badge: body.badge || null,
    sizes: body.sizes,
    stock: body.stock ?? {},
    description: body.description,
    best_seller: Boolean(body.bestSeller),
    is_new: Boolean(body.isNew),
    on_request: Boolean(body.onRequest),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // A home e as páginas de produto são geradas de forma estática — sem isso, um produto novo só
  // apareceria no site depois do próximo deploy.
  revalidatePath("/")
  revalidatePath("/produto/[slug]", "page")

  return NextResponse.json({ ok: true })
}
