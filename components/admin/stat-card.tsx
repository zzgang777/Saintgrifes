import type { LucideIcon } from "lucide-react"

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
        <Icon className="size-4.5" />
      </span>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-3 text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}
