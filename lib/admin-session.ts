// Sessão do painel admin: o cookie guarda os dados da sessão (dono da loja, ou membro da equipe com
// suas permissões) e uma assinatura (HMAC-SHA256) feita com a senha do painel. Sem saber a senha,
// ninguém consegue fabricar um cookie válido; trocar a senha derruba todas as sessões abertas.
// Usa Web Crypto, que funciona no proxy e nas rotas.

const encoder = new TextEncoder()

const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ""

async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("")
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function toBase64Url(str: string) {
  let binary = ""
  encoder.encode(str).forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(str: string) {
  const binary = atob(str.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export const ADMIN_SESSION_DAYS = 7

export type AdminSessionData =
  | { role: "owner" }
  | { role: "member"; id: string; email: string; permissions: string[] }

export async function createAdminSession(data: AdminSessionData) {
  const payload = toBase64Url(JSON.stringify({ ...data, exp: Date.now() + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000 }))
  return `${payload}.${await sign(payload)}`
}

export async function readAdminSession(token: string | undefined): Promise<AdminSessionData | null> {
  if (!token || !secret()) return null
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return null
  if (!safeEqual(signature, await sign(payload))) return null
  try {
    const data = JSON.parse(fromBase64Url(payload)) as AdminSessionData & { exp: number }
    if (!Number.isFinite(data.exp) || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export async function isValidAdminSession(token: string | undefined) {
  return (await readAdminSession(token)) !== null
}
