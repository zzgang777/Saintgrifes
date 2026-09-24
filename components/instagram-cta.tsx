"use client"

import { motion } from "motion/react"
import { InstagramIcon } from "@/components/instagram-icon"
import { siteConfig } from "@/lib/site"
import { GlitchTitle } from "@/components/glitch-title"

export function InstagramCta() {
  return (
    <section className="border-y border-border bg-black/30 text-bone">
      <motion.div
        className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center lg:py-20"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <GlitchTitle className="font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl text-balance">Ficou em dúvida?</GlitchTitle>
        <p className="max-w-xl text-lg text-primary-foreground/85 text-pretty">
          Chame a gente no Instagram e confira nossas peças disponíveis.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={siteConfig.instagramDmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-bone px-8 py-4 font-semibold uppercase tracking-wide text-ink"
          >
            <InstagramIcon className="size-5" />
            Chamar no Instagram
          </motion.a>
        </div>
      </motion.div>
    </section>
  )
}
