"use client"

import { useRouter } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { PERIODS, type Period } from "@/lib/periods"

export function PeriodSelect({ value }: { value: Period }) {
  const router = useRouter()

  return (
    <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
      <CalendarDays className="size-4 text-zinc-500" aria-hidden />
      <span className="sr-only">Período</span>
      <select
        value={value}
        onChange={(e) => router.push(`/admin?dias=${e.target.value}`)}
        className="cursor-pointer bg-transparent pr-1 text-white outline-none"
      >
        {PERIODS.map((days) => (
          <option key={days} value={days} className="bg-zinc-900">
            {days} dias
          </option>
        ))}
      </select>
    </label>
  )
}
