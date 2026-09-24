"use client"

import { motion } from "motion/react"
import { InstagramIcon } from "@/components/instagram-icon"
import { siteConfig } from "@/lib/site"

export function InstagramFloat() {
  return (
    <motion.a
      href={siteConfig.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir o Instagram da Saint Grifes"
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
    >
      <InstagramIcon className="size-7" />
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" aria-hidden />
    </motion.a>
  )
}
