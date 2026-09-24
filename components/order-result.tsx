"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { siteConfig } from "@/lib/site"

export type ResultKind = "sucesso" | "pendente" | "recusado"

const content = {
  checking: {
    Icon: Clock,
    tone: "text-muted-foreground",
    title: "Confirmando seu pagamento",
    text: "Só um instante, estamos confirmando com o Mercado Pago.",
  },
  sucesso: {
    Icon: CheckCircle2,
    tone: "text-emerald-400",
    title: "Pagamento aprovado",
    text: "Recebemos seu pedido. Vamos separar suas peças e entrar em contato pelo e-mail e telefone que você informou.",
  },
  pendente: {
    Icon: Clock,
    tone: "text-signal",
    title: "Aguardando pagamento",
    text: "Seu pedido foi registrado e estamos esperando a confirmação. Pix e boleto podem levar alguns minutos (ou até 2 dias úteis, no caso do boleto). Você recebe o aviso por e-mail.",
  },
  recusado: {
    Icon: XCircle,
    tone: "text-signal",
    title: "Pagamento não aprovado",
    text: "Não conseguimos concluir o pagamento. Nenhum valor foi cobrado. Você pode tentar de novo com outra forma de pagamento; suas peças continuam no carrinho.",
  },
} as const

export function OrderResult({ kind }: { kind: ResultKind }) {
  const params = useSearchParams()
  const { clear } = useCart()
  const orderId = params.get("external_reference")
  // Na volta do Mercado Pago, a página confere a situação real do pedido: Pix e boleto voltam para cá
  // antes de serem pagos, então "sucesso" na URL sozinho não quer dizer "pago".
  const [live, setLive] = useState<ResultKind | "checking">(kind === "sucesso" && orderId ? "checking" : kind)
  const { Icon, tone, title, text } = content[live]

  useEffect(() => {
    if (kind === "sucesso") clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind])

  useEffect(() => {
    if (kind !== "sucesso" || !orderId) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const startedAt = Date.now()

    const check = async () => {
      let done = false
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" })
        if (res.ok) {
          const { status } = await res.json()
          if (status === "paid") {
            if (!cancelled) setLive("sucesso")
            done = true
          } else if (status === "failed" || status === "cancelled") {
            if (!cancelled) setLive("recusado")
            done = true
          } else if (!cancelled) {
            setLive("pendente")
          }
        }
      } catch {
        // tenta de novo abaixo
      }
      if (done || cancelled) return
      if (Date.now() - startedAt > 30_000) {
        setLive("pendente")
        return
      }
      timer = setTimeout(check, 2500)
    }

    void check()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [kind, orderId])

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center">
      <Icon className={`size-14 ${tone}`} aria-hidden />
      <h1 className="font-display text-4xl uppercase sm:text-5xl">{title}</h1>
      {orderId && (
        <p className="text-sm text-muted-foreground">
          Pedido <span className="font-semibold text-foreground">#{orderId.slice(0, 8).toUpperCase()}</span>
        </p>
      )}
      <p className="text-pretty text-muted-foreground">{text}</p>
      {(live === "sucesso" || live === "pendente") && (
        <p className="w-full rounded-sm border border-signal/40 bg-primary/10 p-3.5 text-sm text-signal">
          Após o pedido ser finalizado, chamaremos você no WhatsApp para confirmar os detalhes da entrega.
        </p>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {live === "recusado" && (
          <Link
            href="/checkout"
            className="rounded-sm bg-primary px-7 py-3.5 font-display text-lg uppercase tracking-wider text-primary-foreground hover:bg-accent"
          >
            Tentar de novo
          </Link>
        )}
        <Link
          href="/#mais-desejados"
          className="rounded-sm border border-border px-7 py-3.5 font-display text-lg uppercase tracking-wider hover:border-muted-foreground"
        >
          Voltar à loja
        </Link>
        <a
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm border border-border px-7 py-3.5 font-display text-lg uppercase tracking-wider hover:border-muted-foreground"
        >
          Instagram
        </a>
      </div>
    </div>
  )
}
