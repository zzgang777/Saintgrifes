"use client"

import { useMemo, useState } from "react"
import { ShoppingCart, TrendingDown, TrendingUp, DollarSign } from "lucide-react"
import { formatBRL } from "@/lib/format"
import type { DayPoint } from "@/lib/dashboard"

type Mode = "revenue" | "orders"

const W = 800
const H = 240
const PAD = { top: 16, right: 12, bottom: 28, left: 52 }

// Escala "redonda" para o eixo Y (1, 2, 5 × 10^n).
function niceMax(value: number) {
  if (value <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(value)))
  const n = value / exp
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * exp
}

const compactBRL = (v: number) => (v >= 1000 ? `R$ ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `R$ ${Math.round(v)}`)

export function SalesChart({
  points,
  changePercent,
}: {
  points: DayPoint[]
  changePercent: number | null
}) {
  const [mode, setMode] = useState<Mode>("revenue")
  const [hover, setHover] = useState<number | null>(null)

  const values = useMemo(() => points.map((p) => (mode === "revenue" ? p.revenue : p.orders)), [points, mode])
  const max = niceMax(Math.max(...values, 0))
  const total = values.reduce((sum, v) => sum + v, 0)

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
  const area = `${line} L${x(values.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)
  const labelEvery = Math.ceil(points.length / 8)
  const format = (v: number) => (mode === "revenue" ? formatBRL(v) : String(v))

  const active = hover !== null ? hover : null
  const positive = changePercent !== null && changePercent >= 0

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">Vendas</h2>
          <p className={`mt-1 flex items-center gap-1.5 text-xs ${changePercent === null ? "text-zinc-500" : positive ? "text-emerald-400" : "text-red-400"}`}>
            {changePercent === null ? null : positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {changePercent === null ? "Sem período anterior para comparar" : `${positive ? "+" : ""}${changePercent.toFixed(1)}% vs período anterior`}
          </p>
        </div>

        <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-sm" role="group" aria-label="Métrica do gráfico">
          {(
            [
              ["revenue", "Receita", DollarSign],
              ["orders", "Pedidos", ShoppingCart],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              aria-pressed={mode === key}
              onClick={() => setMode(key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                mode === key ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-zinc-950/60 p-4">
          <p className="flex items-center gap-1.5 text-sm text-zinc-400">
            <DollarSign className="size-4 text-emerald-400" aria-hidden /> Receita total
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{formatBRL(points.reduce((s, p) => s + p.revenue, 0))}</p>
        </div>
        <div className="rounded-xl bg-zinc-950/60 p-4">
          <p className="flex items-center gap-1.5 text-sm text-zinc-400">
            <ShoppingCart className="size-4 text-sky-400" aria-hidden /> Total de pedidos
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{points.reduce((s, p) => s + p.orders, 0)}</p>
        </div>
      </div>

      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Gráfico de ${mode === "revenue" ? "receita" : "pedidos"} por dia. Total no período: ${format(total)}`}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const px = ((e.clientX - rect.left) / rect.width) * W
            const ratio = (px - PAD.left) / innerW
            setHover(Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1)))))
          }}
        >
          <defs>
            <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#1b2646" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#7d89ab">
                {mode === "revenue" ? compactBRL(t) : Math.round(t)}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text key={p.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#7d89ab">
                {p.label}
              </text>
            ) : null,
          )}

          <path d={area} fill="url(#sales-fill)" />
          <path d={line} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} stroke="#45537e" strokeDasharray="3 3" />
              <circle cx={x(active)} cy={y(values[active])} r="5" fill="#34d399" stroke="#0a0f1e" strokeWidth="2" />
            </g>
          )}
        </svg>

        {active !== null && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs shadow-xl"
            style={{ left: `${(x(active) / W) * 100}%` }}
          >
            <p className="text-zinc-400">{points[active].label}</p>
            <p className="font-semibold text-white">{format(values[active])}</p>
          </div>
        )}
      </div>
    </section>
  )
}
