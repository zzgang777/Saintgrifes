"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "motion/react"

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink">
      <div className="relative aspect-[1670/941] w-full">
        <motion.div className="absolute inset-0" style={{ y, scale }}>
          <Image
            src="/banner-inicio-2.webp"
            alt="Sejam bem-vindos"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            unoptimized
          />
        </motion.div>
      </div>
    </section>
  )
}
