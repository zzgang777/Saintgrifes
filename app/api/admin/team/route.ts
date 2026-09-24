import { NextResponse } from "next/server"
import { createAdminUser, listAdminUsers } from "@/lib/admin-users"

export async function GET() {
  const members = await listAdminUsers()
  return NextResponse.json({ members })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  const permissions = Array.isArray(body.permissions) ? body.permissions.filter((p: unknown) => typeof p === "string") : []

  const result = await createAdminUser({
    email: String(body.email ?? ""),
    password: String(body.password ?? ""),
    permissions,
  })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
