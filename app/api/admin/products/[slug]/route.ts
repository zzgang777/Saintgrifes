import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Banco de dados não configurado. Veja o arquivo .env.example." },
      { status: 503 },
    )
  }

  const { slug } = await params
  const body = await request.json()

  const { error } = await supabaseAdmin
    .from("products")
    .update({
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
    .eq("slug", slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Home e página de produto são estáticas — sem isso, a edição só apareceria no próximo deploy.
  revalidatePath("/")
  revalidatePath(`/produto/${slug}`)

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Banco de dados não configurado. Veja o arquivo .env.example." },
      { status: 503 },
    )
  }

  const { slug } = await params
  const { error } = await supabaseAdmin.from("products").delete().eq("slug", slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  revalidatePath("/")
  revalidatePath(`/produto/${slug}`)

  return NextResponse.json({ ok: true })
}
