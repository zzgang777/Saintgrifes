"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase?.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-signal hover:text-signal disabled:opacity-60"
    >
      {loading ? "Saindo..." : "Sair da conta"}
    </button>
  )
}
