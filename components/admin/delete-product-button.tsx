"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Trash2 } from "lucide-react"

export function DeleteProductButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setLoading(true)
    setError("")
    const res = await fetch(`/api/admin/products/${slug}`, { method: "DELETE" })
    if (res.ok) {
      router.refresh()
      setConfirming(false)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Não foi possível remover o produto.")
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        aria-label={`Remover ${name}`}
        className="text-zinc-500 transition-colors hover:text-red-500"
      >
        <Trash2 className="size-4" />
      </button>

      <AnimatePresence>
        {confirming && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setConfirming(false)}
              aria-hidden
            />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              className="relative w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-medium text-white">Remover &ldquo;{name}&rdquo;?</p>
              <p className="mt-1 text-sm text-zinc-400">Essa ação não pode ser desfeita.</p>
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {loading ? "Removendo..." : "Remover"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
