"use client"

import { createBrowserClient } from "@supabase/ssr"

// Cliente do Supabase para usar em componentes de cliente ("use client"): cadastro, login e
// logout de conta de cliente. A sessão fica guardada em cookies (não em localStorage), pra o
// servidor também conseguir ler quem está logado.
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createBrowserClient(url, anonKey)
}
