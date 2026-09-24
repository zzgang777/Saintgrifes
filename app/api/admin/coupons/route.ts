import { NextResponse } from "next/server"
import { createCoupon, listCoupons, type CouponType } from "@/lib/coupons"

export async function GET() {
  const coupons = await listCoupons()
  return NextResponse.json({ coupons })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  const type: CouponType = body.type === "percentage" ? "percentage" : "fixed"
  const value = Number(body.value)
  const minOrderValue = Number(body.minOrderValue) || 0
  const usageLimit = body.usageLimit === "" || body.usageLimit == null ? null : Number(body.usageLimit)
  const expiresAt = body.expiresAt || null

  if (type === "percentage" && (value <= 0 || value > 100)) {
    return NextResponse.json({ error: "O percentual precisa estar entre 1 e 100." }, { status: 400 })
  }

  const result = await createCoupon({
    code: String(body.code ?? ""),
    type,
    value,
    minOrderValue,
    usageLimit,
    expiresAt,
  })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
