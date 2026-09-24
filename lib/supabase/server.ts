import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Cliente do Supabase para Server Components e rotas de API: lê a sessão da conta do cliente
// (não a do admin, que é outro cookie separado) a partir dos cookies da requisição.
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Chamado de dentro de um Server Component (sem permissão de escrever cookie) — sem
          // problema, o proxy.ts já cuida de renovar a sessão a cada requisição.
        }
      },
    },
  })
}

// Só o usuário logado (ou null), sem precisar montar o cliente inteiro toda vez.
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
