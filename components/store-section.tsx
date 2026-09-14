"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { Clock, MapPin, Navigation } from "lucide-react"
import { siteConfig } from "@/lib/site"

const hours = [
  { day: "Segunda a sábado", time: "09:00 às 19:00", open: [9 * 60, 19 * 60] },
  { day: "Domingo", time: "09:00 às 13:30", open: [9 * 60, 13 * 60 + 30] },
]

function useIsOpenNow() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const minutes = now.getHours() * 60 + now.getMinutes()
      const range = now.getDay() === 0 ? hours[1].open : hours[0].open
      setIsOpen(minutes >= range[0] && minutes < range[1])
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  return isOpen
}

export function StoreSection() {
  const isOpen = useIsOpenNow()

  return (
    <section id="contato" className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
      <motion.div
        className="grid overflow-hidden rounded-2xl border border-border lg:grid-cols-2"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Visite nossa loja */}
        <div className="relative flex flex-col justify-center gap-6 overflow-hidden bg-secondary p-8 lg:p-14">
          <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-[0.06]">
            <Image src="/estilo-da-ilha-mark.png" alt="" width={280} height={280} aria-hidden />
          </div>

          <div className="relative flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <MapPin className="size-7" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
                Visite nossa loja
              </h2>
              <p className="mt-2 text-lg font-medium text-muted-foreground">{siteConfig.city}</p>
            </div>
          </div>

          <p className="relative max-w-sm text-muted-foreground text-pretty">
            Passe na loja e conheça as peças de perto — provador à vontade e atendimento sem pressa.
          </p>

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex w-fit items-center gap-2 rounded-lg bg-foreground px-7 py-3.5 font-semibold uppercase tracking-wide text-background transition-opacity hover:opacity-90"
          >
            <Navigation className="size-5" aria-hidden />
            Como chegar
          </motion.a>
        </div>

        {/* Horário de funcionamento */}
        <div className="flex flex-col justify-center gap-6 bg-foreground p-8 text-background lg:p-14">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="size-6 text-primary" aria-hidden />
              <h3 className="font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">
                Horário
              </h3>
            </div>
            {isOpen !== null && (
              <span
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                  isOpen ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/60"
                }`}
              >
                <span className="relative flex size-2">
                  {isOpen && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex size-2 rounded-full ${isOpen ? "bg-emerald-400" : "bg-white/40"}`} />
                </span>
                {isOpen ? "Aberto agora" : "Fechado agora"}
              </span>
            )}
          </div>

          <ul className="flex flex-col gap-4">
            {hours.map((h) => (
              <li key={h.day} className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <span className="text-white/70">{h.day}</span>
                <span className="font-display text-xl text-white">{h.time}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-lg bg-primary px-5 py-4 text-center">
            <p className="font-display text-xl uppercase tracking-wide text-primary-foreground">
              Não fechamos para almoço!
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
