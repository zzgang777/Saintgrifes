"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { ORDERS_PERMISSION } from "@/lib/admin-permissions"

export function TeamMemberActions({ id, email, active, permissions }: { id: string; email: string; active: boolean; permissions: string[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const patch = async (body: Record<string, unknown>) => {
    setLoading(true)
    await fetch(`/api/admin/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    router.refresh()
    setLoading(false)
  }

  const togglePermission = () => {
    const has = permissions.includes(ORDERS_PERMISSION)
    patch({ permissions: has ? permissions.filter((p) => p !== ORDERS_PERMISSION) : [...permissions, ORDERS_PERMISSION] })
  }

  const remove = async () => {
    if (!confirm(`Remover o acesso de "${email}"? Essa ação não pode ser desfeita.`)) return
    setLoading(true)
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={togglePermission} disabled={loading} className="text-xs font-medium text-indigo-400 hover:underline disabled:opacity-50">
        {permissions.includes(ORDERS_PERMISSION) ? "Tirar acesso a pedidos" : "Dar acesso a pedidos"}
      </button>
      <button type="button" onClick={() => patch({ active: !active })} disabled={loading} className="text-xs font-medium text-indigo-400 hover:underline disabled:opacity-50">
        {active ? "Desativar" : "Ativar"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        aria-label={`Remover ${email}`}
        className="text-zinc-500 transition-colors hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
