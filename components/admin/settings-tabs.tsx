"use client"

import { useState } from "react"
import { siteConfig } from "@/lib/site"

const tabs = [
  { key: "geral", label: "Geral" },
  { key: "contato", label: "Contato" },
  { key: "horarios", label: "Horários" },
] as const

type TabKey = (typeof tabs)[number]["key"]

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-zinc-400">{label}</label>
      {multiline ? (
        <textarea
          readOnly
          value={value}
          rows={3}
          className="resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none"
        />
      ) : (
        <input
          readOnly
          value={value}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none"
        />
      )}
    </div>
  )
}

export function SettingsTabs() {
  const [active, setActive] = useState<TabKey>("geral")

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 p-5">
        <div>
          <h1 className="text-lg font-semibold text-white">Configurações</h1>
          <p className="text-sm text-zinc-400">Dados usados no site — hoje editados em lib/site.ts.</p>
        </div>
        <button
          disabled
          title="Ainda não conectado a um banco de dados"
          className="cursor-not-allowed rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-500"
        >
          Salvar
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 px-5 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-b-2 border-indigo-500 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {active === "geral" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome da loja" value={siteConfig.name} />
            <Field label="Cidade" value={siteConfig.city} />
            <Field label="Tagline" value={siteConfig.tagline} />
          </div>
        )}

        {active === "contato" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Instagram" value={siteConfig.instagramUrl} />
            <Field label="Conversa direta (DM) do Instagram" value={siteConfig.instagramDmUrl} />
          </div>
        )}

        {active === "horarios" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Dias úteis" value={siteConfig.hours.weekdays} />
            <Field label="Domingo" value={siteConfig.hours.sunday} />
          </div>
        )}
      </div>
    </div>
  )
}
