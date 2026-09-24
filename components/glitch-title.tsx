"use client"

import { Fragment, useCallback, useEffect, useRef, useState, type ElementType } from "react"
import { useInView, useReducedMotion } from "motion/react"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=?/<>"
const FRAMES = 14
const FRAME_MS = 50

// Título que se "decodifica": as letras aparecem embaralhadas (em vermelho) e vão se fixando da
// esquerda para a direita. Toca ao entrar na tela e ao passar o mouse.
export function GlitchTitle({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: string
  as?: ElementType
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()
  const [frame, setFrame] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const run = useCallback(() => {
    if (reduceMotion || timer.current) return
    let f = 0
    timer.current = setInterval(() => {
      f += 1
      if (f >= FRAMES) {
        if (timer.current) clearInterval(timer.current)
        timer.current = null
        setFrame(null)
      } else {
        setFrame(f)
      }
    }, FRAME_MS)
  }, [reduceMotion])

  useEffect(() => {
    if (inView) run()
  }, [inView, run])

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current)
    },
    [],
  )

  const total = children.length
  const revealed = frame === null ? total : Math.max(0, Math.floor(((frame - 3) / (FRAMES - 4)) * total))
  let cursor = 0

  return (
    <Tag ref={ref} onMouseEnter={run} className={className}>
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {children.split(" ").map((word, w) => {
          const start = cursor
          cursor += word.length + 1
          return (
            <Fragment key={w}>
              {w > 0 && " "}
              <span className="inline-block whitespace-nowrap">
                {[...word].map((char, i) => {
                  const scrambled = start + i >= revealed
                  return (
                    <span key={i} className="relative inline-block">
                      <span className={scrambled ? "invisible" : undefined}>{char}</span>
                      {scrambled && (
                        <span className="absolute inset-0 flex items-center justify-center text-signal">
                          {GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}
                        </span>
                      )}
                    </span>
                  )
                })}
              </span>
            </Fragment>
          )
        })}
      </span>
    </Tag>
  )
}
