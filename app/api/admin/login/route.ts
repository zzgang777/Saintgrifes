import { NextResponse } from "next/server"
import { ADMIN_SESSION_DAYS, createAdminSession, type AdminSessionData } from "@/lib/admin-session"
import { verifyAdminCredentials } from "@/lib/admin-users"

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({ email: "", password: "" }))
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
  }

  let session: AdminSessionData

  if (typeof email === "string" && email.trim()) {
    // Login de membro da equipe: e-mail + senha cadastrados pelo titular em /admin/equipe.
    const member = await verifyAdminCredentials(email, password)
    if (!member) return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 })
    session = { role: "member", id: member.id, email: member.email, permissions: member.permissions }
  } else {
    // Login do titular da loja: senha única (ADMIN_PASSWORD).
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: "A senha do painel ainda não foi configurada (ADMIN_PASSWORD)." }, { status: 503 })
    }
    if (password !== adminPassword) return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    session = { role: "owner" }
  }

  const response = NextResponse.json({ ok: true, role: session.role })
  response.cookies.set("admin_session", await createAdminSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * ADMIN_SESSION_DAYS,
    path: "/",
  })
  return response
}
