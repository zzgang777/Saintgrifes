"use client"

import { motion } from "motion/react"
import { MessageCircle, ShoppingBag } from "lucide-react"
import { siteConfig, whatsappLink } from "@/lib/site"

export function WhatsappSection() {
  return (
    <section className="bg-primary text-primary-foreground">
      <motion.div
        className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center lg:py-20"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl text-balance">
          Ficou em dúvida?
        </h2>
        <p className="max-w-xl text-lg text-primary-foreground/85 text-pretty">
          Fale com nossa equipe pelo WhatsApp e confira nossas peças disponíveis.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-8 py-4 font-semibold uppercase tracking-wide text-foreground"
          >
            <MessageCircle className="size-5" aria-hidden />
            Falar no WhatsApp
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={siteConfig.catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary-foreground/40 px-8 py-4 font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            <ShoppingBag className="size-5" aria-hidden />
            Ver catálogo
          </motion.a>
        </div>
      </motion.div>
    </section>
  )
}
