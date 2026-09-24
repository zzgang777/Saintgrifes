"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { AVAILABLE_PERMISSIONS } from "@/lib/admin-permissions"

const inputClass =
  "rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50"

export function TeamMemberForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const togglePermission = (key: string) => {
    setPermissions((current) => (current.includes(key) ? current.filter((p) => p !== key) : [...current, key]))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, permissions }),
    })

    if (res.ok) {
      router.push("/admin/equipe")
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Não foi possível criar a conta.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">E-mail (Gmail)</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colaborador@gmail.com"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Senha</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Pelo menos 6 caracteres"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-400">Permissões</p>
        {AVAILABLE_PERMISSIONS.map((perm) => (
          <label
            key={perm.key}
            className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-950 p-3.5 text-sm text-zinc-300"
          >
            <input
              type="checkbox"
              checked={permissions.includes(perm.key)}
              onChange={() => togglePermission(perm.key)}
              className="mt-0.5 size-4 shrink-0"
            />
            <span>
              <span className="block font-medium text-white">{perm.label}</span>
              <span className="block text-xs text-zinc-500">{perm.description}</span>
            </span>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Criando..." : "Criar conta"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/equipe")}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
