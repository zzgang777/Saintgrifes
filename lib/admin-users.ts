import { supabaseAdmin } from "@/lib/supabase"
import { safeEqual } from "@/lib/admin-session"
import { ORDERS_PERMISSION } from "@/lib/admin-permissions"

export { ORDERS_PERMISSION, AVAILABLE_PERMISSIONS } from "@/lib/admin-permissions"

export type AdminUser = {
  id: string
  email: string
  permissions: string[]
  active: boolean
  createdAt: string
}

type AdminUserRow = {
  id: string
  email: string
  password_hash: string
  permissions: string[] | null
  active: boolean
  created_at: string
}

const mapAdminUser = (row: AdminUserRow): AdminUser => ({
  id: row.id,
  email: row.email,
  permissions: row.permissions ?? [],
  active: row.active,
  createdAt: row.created_at,
})

const encoder = new TextEncoder()
const PBKDF2_ITERATIONS = 100_000

function toHex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("")
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

async function pbkdf2Hex(password: string, salt: Uint8Array, iterations: number) {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"])
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" }, keyMaterial, 256)
  return toHex(bits)
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2Hex(password, salt, PBKDF2_ITERATIONS)
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${hash}`
}

async function verifyPassword(password: string, stored: string) {
  const [iterations, saltHex, hashHex] = stored.split(":")
  if (!iterations || !saltHex || !hashHex) return false
  const computed = await pbkdf2Hex(password, fromHex(saltHex), Number(iterations))
  return safeEqual(computed, hashHex)
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as AdminUserRow[]).map(mapAdminUser)
}

export type NewAdminUser = { email: string; password: string; permissions: string[] }

export async function createAdminUser(input: NewAdminUser): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabaseAdmin) return { ok: false, error: "Banco de dados não configurado." }
  const email = input.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Informe um e-mail válido." }
  if (input.password.length < 6) return { ok: false, error: "A senha precisa ter pelo menos 6 caracteres." }

  const password_hash = await hashPassword(input.password)
  const { error } = await supabaseAdmin.from("admin_users").insert({ email, password_hash, permissions: input.permissions })
  if (error) return { ok: false, error: error.code === "23505" ? "Já existe uma conta com esse e-mail." : error.message }
  return { ok: true }
}

export async function setAdminUserActive(id: string, active: boolean) {
  if (!supabaseAdmin) return
  await supabaseAdmin.from("admin_users").update({ active }).eq("id", id)
}

export async function setAdminUserPermissions(id: string, permissions: string[]) {
  if (!supabaseAdmin) return
  await supabaseAdmin.from("admin_users").update({ permissions }).eq("id", id)
}

export async function deleteAdminUser(id: string) {
  if (!supabaseAdmin) return
  await supabaseAdmin.from("admin_users").delete().eq("id", id)
}

// Confere e-mail + senha contra o banco na hora do login de um membro da equipe (o dono da loja
// continua entrando só com ADMIN_PASSWORD, sem passar por aqui).
export async function verifyAdminCredentials(emailInput: string, password: string): Promise<AdminUser | null> {
  if (!supabaseAdmin) return null
  const email = emailInput.trim().toLowerCase()
  const { data } = await supabaseAdmin.from("admin_users").select("*").eq("email", email).maybeSingle()
  if (!data) return null
  const row = data as AdminUserRow
  if (!row.active) return null
  const ok = await verifyPassword(password, row.password_hash)
  return ok ? mapAdminUser(row) : null
}

// E-mails de quem deve ser avisado quando um pedido é feito/aprovado: membros ativos com a
// permissão de ver pedidos.
export async function listOrderNotificationRecipients(): Promise<string[]> {
  if (!supabaseAdmin) return []
  const { data } = await supabaseAdmin.from("admin_users").select("email, permissions").eq("active", true)
  if (!data) return []
  return (data as { email: string; permissions: string[] | null }[])
    .filter((row) => (row.permissions ?? []).includes(ORDERS_PERMISSION))
    .map((row) => row.email)
}
