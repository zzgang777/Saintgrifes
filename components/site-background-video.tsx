"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

// Vídeo de fundo (céu estrelado, em loop) atrás de todo o conteúdo da loja. Não aparece no admin
// (fundo sólido, sem esse clima) nem para quem pede menos movimento no sistema.
export function SiteBackgroundVideo() {
  const pathname = usePathname()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  if (pathname?.startsWith("/admin") || reducedMotion) return null

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 -z-20 h-full w-full object-cover [filter:brightness(0.85)_saturate(0.9)]"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
    >
      <source src="/background.mp4" type="video/mp4" />
    </video>
  )
}
