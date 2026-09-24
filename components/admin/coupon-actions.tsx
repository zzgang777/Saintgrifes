"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function CouponActions({ code, active }: { code: string; active: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggleActive = async () => {
    setLoading(true)
    await fetch(`/api/admin/coupons/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    })
    router.refresh()
    setLoading(false)
  }

  const remove = async () => {
    if (!confirm(`Remover o cupom "${code}"? Essa ação não pode ser desfeita.`)) return
    setLoading(true)
    await fetch(`/api/admin/coupons/${code}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleActive}
        disabled={loading}
        className="text-xs font-medium text-indigo-400 hover:underline disabled:opacity-50"
      >
        {active ? "Desativar" : "Ativar"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        aria-label={`Remover cupom ${code}`}
        className="text-zinc-500 transition-colors hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
