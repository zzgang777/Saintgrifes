import type { LucideIcon } from "lucide-react"

const tones = {
  indigo: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/20",
  green: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  purple: "bg-violet-500/15 text-violet-300 ring-violet-400/20",
  blue: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
  pink: "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-400/20",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  red: "bg-red-500/15 text-red-300 ring-red-400/20",
  slate: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
} as const

export type StatTone = keyof typeof tones

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "indigo",
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  tone?: StatTone
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg shadow-black/10 transition-colors hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-zinc-400">{label}</p>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
      {hint && <p className="mt-2 text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}
