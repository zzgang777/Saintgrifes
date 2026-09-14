import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Cliente público — só leitura, usado pela loja e pelo painel para exibir dados.
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null

// Cliente com privilégio de administrador — só usado em rotas de API do /admin
// (nunca no navegador) para criar, editar e apagar produtos e categorias.
export const supabaseAdmin =
  isSupabaseConfigured && supabaseServiceRoleKey
    ? createClient(supabaseUrl!, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null
