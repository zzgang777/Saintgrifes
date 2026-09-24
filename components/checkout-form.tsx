"use client"

import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { onlyDigits, type ShippingOption } from "@/lib/checkout"
import { formatBRL } from "@/lib/format"
import { siteConfig } from "@/lib/site"

const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
const maskCep = (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2")

const inputClass =
  "w-full rounded-sm border border-border bg-secondary px-3.5 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-signal"

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

export function CheckoutForm({ initialName = "", initialEmail = "" }: { initialName?: string; initialEmail?: string }) {
  const { items, subtotal } = useCart()
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [phone, setPhone] = useState("")
  const [cep, setCep] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [district, setDistrict] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [cepMessage, setCepMessage] = useState("")
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [quoting, setQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [reviewOpen, setReviewOpen] = useState(false)
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  const selected = options.find((o) => o.id === selectedId)
  const shippingCost = selected?.price ?? 0
  const discount = appliedCoupon?.discount ?? 0
  const total = subtotal + shippingCost - discount

  const cartKey = JSON.stringify(items.map((i) => [i.slug, i.size, i.quantity]))
  const cepDigits = onlyDigits(cep)

  // Se o carrinho mudar, o desconto aplicado pode não valer mais (ex.: valor mínimo do cupom) —
  // melhor pedir pra aplicar de novo do que arriscar mostrar um valor que o servidor vai recusar.
  useEffect(() => {
    setAppliedCoupon(null)
  }, [cartKey])

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError("")
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput,
          items: items.map((i) => ({ slug: i.slug, size: i.size, quantity: i.quantity })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!data.ok) {
        setCouponError(data.error ?? "Não foi possível aplicar o cupom.")
        return
      }
      setAppliedCoupon({ code: data.code, discount: data.discount })
      setCouponInput("")
    } catch {
      setCouponError("Não foi possível aplicar o cupom agora. Tente de novo.")
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponError("")
  }

  // Calcula o frete assim que o CEP estiver completo (e de novo se o carrinho mudar).
  useEffect(() => {
    setQuoteError("")
    if (cepDigits.length !== 8 || items.length === 0) {
      setOptions([])
      setSelectedId("")
      return
    }
    let cancelled = false
    setQuoting(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cep: cepDigits, items: items.map((i) => ({ slug: i.slug, size: i.size, quantity: i.quantity })) }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        const list: ShippingOption[] = Array.isArray(data.options) ? data.options : []
        setOptions(list)
        setSelectedId((current) => (list.some((o) => o.id === current) ? current : (list[0]?.id ?? "")))
        setQuoteError(list.length === 0 ? (data.error ?? "Não foi possível calcular o frete para esse CEP.") : "")
      } catch {
        if (!cancelled) {
          setOptions([])
          setSelectedId("")
          setQuoteError("Não foi possível calcular o frete agora. Tente de novo em instantes.")
        }
      } finally {
        if (!cancelled) setQuoting(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepDigits, cartKey])

  const lookupCep = async (value: string) => {
    const digits = onlyDigits(value)
    if (digits.length !== 8) return
    setCepMessage("Buscando endereço...")
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepMessage("CEP não encontrado. Preencha o endereço manualmente.")
        return
      }
      setStreet(data.logradouro ?? "")
      setDistrict(data.bairro ?? "")
      setCity(data.localidade ?? "")
      setState(data.uf ?? "")
      setCepMessage("")
    } catch {
      setCepMessage("Não foi possível buscar o CEP. Preencha o endereço manualmente.")
    }
  }

  // O clique em "Ir para o pagamento" só abre a revisão — o pedido de verdade só é enviado quando
  // a pessoa confirma na tela de revisão, depois de conferir os dados.
  const handleReview = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!selected) {
      setError("Informe o CEP e escolha uma forma de entrega.")
      return
    }
    setReviewOpen(true)
  }

  const submitOrder = async () => {
    if (!selected) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, size: i.size, quantity: i.quantity })),
          customer: { name, email, phone },
          shipping: {
            optionId: selected.id,
            address: { cep, street, number, complement, district, city, state },
          },
          couponCode: appliedCoupon?.code,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        setError(data.error ?? "Não foi possível finalizar o pedido. Tente de novo.")
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError("Sem conexão. Verifique sua internet e tente de novo.")
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-display text-4xl uppercase">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground">Escolha suas peças na loja e volte aqui para finalizar.</p>
        <Link
          href="/#mais-desejados"
          className="rounded-sm bg-primary px-7 py-3.5 font-display text-lg uppercase tracking-wider text-primary-foreground hover:bg-accent"
        >
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleReview} className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_380px] lg:py-14">
      <div className="flex flex-col gap-10">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">Finalizar compra</h1>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl uppercase">Seus dados</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" className="sm:col-span-2">
              <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="E-mail">
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Telefone (com DDD)" className="sm:col-span-2">
              <input required inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(98) 91234-5678" className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl uppercase">Endereço de entrega</h2>
          <p className="text-sm text-muted-foreground">Enviamos para todo o Brasil. Em São Luís a entrega é no mesmo dia.</p>

          <div className="grid gap-4 sm:grid-cols-6">
            <Field label="CEP" className="sm:col-span-2">
              <input
                required
                inputMode="numeric"
                autoComplete="postal-code"
                value={cep}
                onChange={(e) => {
                  const masked = maskCep(e.target.value)
                  setCep(masked)
                  void lookupCep(masked)
                }}
                placeholder="00000-000"
                className={inputClass}
              />
            </Field>
            <p className="self-end pb-2.5 text-sm text-muted-foreground sm:col-span-4">{cepMessage}</p>
            <Field label="Rua" className="sm:col-span-4">
              <input required autoComplete="address-line1" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Número" className="sm:col-span-2">
              <input required value={number} onChange={(e) => setNumber(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Complemento (opcional)" className="sm:col-span-3">
              <input value={complement} onChange={(e) => setComplement(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Bairro" className="sm:col-span-3">
              <input required value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Cidade" className="sm:col-span-4">
              <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </Field>
            <Field label="UF" className="sm:col-span-2">
              <input required maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-live="polite">
          <h2 className="font-display text-2xl uppercase">Forma de entrega</h2>

          <p className="rounded-sm border border-signal/40 bg-primary/10 p-3.5 text-sm text-signal">
            Após o pedido ser finalizado, chamaremos você no WhatsApp para confirmar os detalhes da entrega.
          </p>

          {cepDigits.length !== 8 && <p className="text-sm text-muted-foreground">Informe o CEP para ver as opções e o valor do frete.</p>}
          {cepDigits.length === 8 && quoting && <p className="text-sm text-muted-foreground">Calculando o frete...</p>}
          {cepDigits.length === 8 && !quoting && quoteError && (
            <p className="rounded-sm border border-signal/40 bg-primary/15 p-3 text-sm text-signal">{quoteError}</p>
          )}

          {!quoting && options.length > 0 && (
            <div className="divide-y divide-border overflow-hidden rounded-sm border border-border" role="radiogroup" aria-label="Forma de entrega">
              {options.map((option) => {
                const active = option.id === selectedId
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedId(option.id)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                      active ? "bg-secondary" : "hover:bg-secondary/50"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        active ? "border-signal" : "border-muted-foreground"
                      }`}
                    >
                      {active && <span className="size-2 rounded-full bg-signal" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.days}</span>
                    </span>
                    <span className="shrink-0 font-display text-lg">{option.price === 0 ? "Grátis" : formatBRL(option.price)}</span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-md border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl uppercase">Resumo</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item) => (
            <li key={`${item.slug}-${item.size}`} className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-secondary">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col text-sm">
                <span className="font-medium leading-tight">{item.name}</span>
                <span className="text-muted-foreground">
                  Tam. {item.size} · {item.quantity}x
                </span>
              </div>
              <span className="text-sm font-semibold">{formatBRL(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-border pt-4">
          <label className="mb-2 block text-sm text-muted-foreground">Cupom de desconto</label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-2 rounded-sm border border-signal/40 bg-primary/10 px-3.5 py-2.5 text-sm">
              <span className="font-mono font-semibold text-signal">{appliedCoupon.code}</span>
              <button type="button" onClick={removeCoupon} className="text-xs text-muted-foreground underline hover:text-foreground">
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Código do cupom"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="shrink-0 rounded-sm border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-signal disabled:opacity-50"
              >
                {couponLoading ? "..." : "Aplicar"}
              </button>
            </div>
          )}
          {couponError && <p className="mt-2 text-sm text-signal">{couponError}</p>}
        </div>

        <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatBRL(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-signal">
              <dt>Desconto ({appliedCoupon?.code})</dt>
              <dd>-{formatBRL(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Entrega</dt>
            <dd>{selected ? (selected.price === 0 ? "Grátis" : formatBRL(selected.price)) : "A calcular"}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl">{formatBRL(total)}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-4 rounded-sm border border-signal/40 bg-primary/15 p-3 text-sm text-signal">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!selected}
          className="mt-5 w-full rounded-sm bg-primary py-3.5 font-display text-lg uppercase tracking-wider text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          Revisar dados
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Você paga em ambiente seguro do Mercado Pago. Dúvidas? Fale com a gente no{" "}
          <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Instagram
          </a>
          .
        </p>
      </aside>

      {reviewOpen && selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => !loading && setReviewOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Revisar pedido"
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-md border border-border bg-card"
          >
            <div className="overflow-y-auto p-6">
              <h2 className="font-display text-2xl uppercase">Revisar pedido</h2>
              <p className="mt-1 text-sm text-muted-foreground">Confira se está tudo certo antes de pagar.</p>

              <div className="mt-5 flex flex-col gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seus dados</p>
                  <p className="mt-1">{name}</p>
                  <p className="text-muted-foreground">{email}</p>
                  <p className="text-muted-foreground">{phone}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Endereço de entrega</p>
                  <p className="mt-1">
                    {street}, {number}
                    {complement ? ` — ${complement}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {district}, {city}/{state} — CEP {cep}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Forma de entrega</p>
                  <p className="mt-1">{selected.label}</p>
                  <p className="text-muted-foreground">{selected.days}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Itens</p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {items.map((item) => (
                      <li key={`${item.slug}-${item.size}`} className="flex justify-between gap-3">
                        <span>
                          {item.quantity}x {item.name} <span className="text-muted-foreground">({item.size})</span>
                        </span>
                        <span className="shrink-0 font-medium">{formatBRL(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-signal">
                    <span>Cupom {appliedCoupon.code}</span>
                    <span>-{formatBRL(appliedCoupon.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-xl">{formatBRL(total)}</span>
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-sm border border-signal/40 bg-primary/15 p-3 text-sm text-signal">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3 border-t border-border p-6 pt-4">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                disabled={loading}
                className="flex-1 rounded-sm border border-border py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-muted-foreground disabled:opacity-60"
              >
                Editar dados
              </button>
              <button
                type="button"
                onClick={submitOrder}
                disabled={loading}
                className="flex-1 rounded-sm bg-primary py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {loading ? "Aguarde..." : "Confirmar e pagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
