import { NextResponse } from "next/server"
import { deleteCoupon, setCouponActive } from "@/lib/coupons"

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const body = await request.json().catch(() => ({}))
  if (typeof body.active !== "boolean") return NextResponse.json({ error: "Requisição inválida." }, { status: 400 })
  await setCouponActive(code, body.active)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  await deleteCoupon(code)
  return NextResponse.json({ ok: true })
}
