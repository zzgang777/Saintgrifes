"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

const inputClass =
  "rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50"

export function CouponForm() {
  const router = useRouter()

  const [code, setCode] = useState("")
  const [type, setType] = useState<"fixed" | "percentage">("fixed")
  const [value, setValue] = useState("")
  const [minOrderValue, setMinOrderValue] = useState("")
  const [unlimited, setUnlimited] = useState(true)
  const [usageLimit, setUsageLimit] = useState("")
  const [neverExpires, setNeverExpires] = useState(true)
  const [expiresAt, setExpiresAt] = useState("")

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        type,
        value: Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        usageLimit: unlimited ? null : Number(usageLimit) || 0,
        expiresAt: neverExpires || !expiresAt ? null : new Date(expiresAt).toISOString(),
      }),
    })

    if (res.ok) {
      router.push("/admin/cupons")
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Não foi possível criar o cupom.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm text-zinc-400">Cupom</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex.: BEMVINDO10"
            className={`${inputClass} font-mono uppercase`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as "fixed" | "percentage")} className={inputClass}>
            <option value="fixed">Valor fixo (R$)</option>
            <option value="percentage">Percentual (%)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Valor {type === "percentage" ? "(%)" : "(R$)"}</label>
          <input
            required
            type="number"
            step={type === "percentage" ? "1" : "0.01"}
            min="0"
            max={type === "percentage" ? "100" : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Valor mínimo do pedido (R$) — opcional</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            placeholder="0,00"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Limite de usos</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="1"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              disabled={unlimited}
              placeholder="0"
              className={`${inputClass} flex-1`}
            />
            <label className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300">
              <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} className="size-4" />
              Ilimitado
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Expira em</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={neverExpires}
              className={`${inputClass} flex-1`}
            />
            <label className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300">
              <input type="checkbox" checked={neverExpires} onChange={(e) => setNeverExpires(e.target.checked)} className="size-4" />
              Nunca
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Criando..." : "Criar cupom"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/cupons")}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
