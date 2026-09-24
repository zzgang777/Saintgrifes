import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { readAdminSession } from "@/lib/admin-session"
import { ORDERS_PERMISSION } from "@/lib/admin-permissions"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Painel admin: cookie próprio, senha do dono da loja (ou e-mail/senha de um membro da
  // equipe) — nada a ver com conta de cliente. ---
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/admin")) {
    if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") return NextResponse.next()

    const session = await readAdminSession(request.cookies.get("admin_session")?.value)

    if (pathname.startsWith("/api/admin")) {
      if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      // Rotas de API do /admin (produtos, cupons, equipe...) são só do titular da loja.
      if (session.role === "member") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      return NextResponse.next()
    }

    if (pathname.startsWith("/admin/login")) {
      if (session) return NextResponse.redirect(new URL(session.role === "member" ? "/admin/pedidos" : "/admin", request.url))
      return NextResponse.next()
    }
    if (!session) return NextResponse.redirect(new URL("/admin/login", request.url))

    if (session.role === "member") {
      // Membro da equipe só acessa "Pedidos", e só se tiver a permissão pra isso.
      if (pathname === "/admin/sem-acesso") return NextResponse.next()
      if (pathname === "/admin") {
        const target = session.permissions.includes(ORDERS_PERMISSION) ? "/admin/pedidos" : "/admin/sem-acesso"
        return NextResponse.redirect(new URL(target, request.url))
      }
      if (!pathname.startsWith("/admin/pedidos") || !session.permissions.includes(ORDERS_PERMISSION)) {
        return NextResponse.redirect(new URL("/admin/sem-acesso", request.url))
      }
    }
    return NextResponse.next()
  }

  // --- Conta do cliente: Supabase Auth. Renova a sessão a cada visita e tranca /conta pra quem
  // não estiver logado (menos as próprias telas de entrar/criar conta). ---
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthPage = pathname === "/conta/entrar" || pathname === "/conta/criar"
    if (pathname.startsWith("/conta") && !isAuthPage && !user) {
      return NextResponse.redirect(new URL("/conta/entrar", request.url))
    }
    if (isAuthPage && user) {
      return NextResponse.redirect(new URL("/conta", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/conta/:path*"],
}
