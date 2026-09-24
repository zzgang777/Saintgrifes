import { NextResponse } from "next/server"
import { deleteAdminUser, setAdminUserActive, setAdminUserPermissions } from "@/lib/admin-users"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  if (typeof body.active === "boolean") await setAdminUserActive(id, body.active)
  if (Array.isArray(body.permissions)) {
    await setAdminUserPermissions(id, body.permissions.filter((p: unknown) => typeof p === "string"))
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteAdminUser(id)
  return NextResponse.json({ ok: true })
}
