import { sizeStock, type Product } from "@/lib/products"

export type Address = {
  cep: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
}

// Uma opção de frete devolvida pela cotação (mesmo dia em São Luís ou Correios).
export type ShippingOption = { id: string; label: string; price: number; days: string }

// O que a cotação precisa saber de cada item do carrinho.
export type QuoteLine = { slug: string; category: string; quantity: number; unitPrice: number }
export type QuoteResult = { options: ShippingOption[]; error?: string }
export type QuoteFn = (cep: string, lines: QuoteLine[]) => Promise<QuoteResult>

export type CheckoutInput = {
  items: { slug: string; size: string; quantity: number }[]
  customer: { name: string; email: string; phone: string }
  shipping: { optionId: string; address: Address }
  couponCode?: string
}

export type OrderLine = { slug: string; name: string; size: string; quantity: number; unitPrice: number }

// Confere o cupom de verdade (o valor de desconto nunca vem do navegador). Injetado do mesmo jeito
// que a cotação de frete, pra este arquivo continuar podendo ser importado no navegador sem trazer
// junto o cliente de admin do Supabase.
export type CouponValidationResult = { ok: true; code: string; discount: number } | { ok: false; error: string }
export type ValidateCouponFn = (code: string, subtotal: number) => Promise<CouponValidationResult>

export type PricedOrder = {
  customer: CheckoutInput["customer"]
  address: Address
  shipping: { optionId: string; label: string; days: string }
  lines: OrderLine[]
  subtotal: number
  shippingCost: number
  discount: number
  couponCode: string | null
  total: number
}

export const onlyDigits = (value: string) => value.replace(/\D/g, "")
const cents = (value: number) => Math.round(value * 100) / 100
const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "")

type Result<T> = { ok: true; value: T } | { ok: false; error: string }

// Confere os itens do carrinho contra o catálogo e devolve as linhas com o preço do banco.
export function resolveItems(
  items: unknown,
  products: Product[],
): Result<{ lines: OrderLine[]; quoteLines: QuoteLine[]; subtotal: number }> {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: "Seu carrinho está vazio." }
  if (items.length > 30) return { ok: false, error: "Itens demais no carrinho." }

  const lines: OrderLine[] = []
  const quoteLines: QuoteLine[] = []
  for (const item of items as { slug: string; size: string; quantity: number }[]) {
    const product = products.find((p) => p.slug === item?.slug)
    const quantity = Number(item?.quantity)
    if (!product) return { ok: false, error: "Um dos produtos do carrinho não existe mais." }
    if (product.onRequest) return { ok: false, error: `${product.name} é vendido sob consulta. Fale com a gente no Instagram.` }
    if (!product.sizes.includes(item.size)) return { ok: false, error: `Tamanho inválido para ${product.name}.` }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return { ok: false, error: "Quantidade inválida." }
    const available = sizeStock(product, item.size)
    if (quantity > available) {
      return {
        ok: false,
        error:
          available > 0
            ? `Só temos ${available} unidade${available > 1 ? "s" : ""} do tamanho ${item.size} em ${product.name}.`
            : `${product.name} (tamanho ${item.size}) está esgotado.`,
      }
    }
    const unitPrice = cents(product.salePrice ?? product.price)
    lines.push({ slug: product.slug, name: product.name, size: item.size, quantity, unitPrice })
    quoteLines.push({ slug: product.slug, category: product.category, quantity, unitPrice })
  }

  const subtotal = cents(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0))
  return { ok: true, value: { lines, quoteLines, subtotal } }
}

// Confere tudo que veio do navegador e recalcula os valores no servidor: preços do banco, frete
// recotado na hora e cupom validado de novo. O total, o frete e o desconto enviados pelo cliente
// nunca são usados.
export async function priceOrder(
  input: unknown,
  products: Product[],
  quote: QuoteFn,
  validateCoupon?: ValidateCouponFn,
): Promise<Result<PricedOrder>> {
  const body = (input ?? {}) as Partial<CheckoutInput>

  const name = clean(body.customer?.name)
  const email = clean(body.customer?.email).toLowerCase()
  const phone = onlyDigits(clean(body.customer?.phone))

  if (name.split(/\s+/).filter(Boolean).length < 2) return { ok: false, error: "Informe seu nome completo." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Informe um e-mail válido." }
  if (phone.length < 10 || phone.length > 11) return { ok: false, error: "Informe um telefone com DDD." }

  const a = body.shipping?.address
  const address: Address = {
    cep: onlyDigits(clean(a?.cep)),
    street: clean(a?.street),
    number: clean(a?.number),
    complement: clean(a?.complement),
    district: clean(a?.district),
    city: clean(a?.city),
    state: clean(a?.state).toUpperCase(),
  }
  if (address.cep.length !== 8) return { ok: false, error: "Informe um CEP válido." }
  if (!address.street || !address.number || !address.district || !address.city || !/^[A-Z]{2}$/.test(address.state)) {
    return { ok: false, error: "Preencha o endereço de entrega completo." }
  }

  const items = resolveItems(body.items, products)
  if (!items.ok) return items

  const optionId = clean(body.shipping?.optionId)
  if (!optionId) return { ok: false, error: "Escolha a forma de entrega." }
  const quoted = await quote(address.cep, items.value.quoteLines)
  const option = quoted.options.find((o) => o.id === optionId)
  if (!option) {
    return { ok: false, error: quoted.error ?? "Essa opção de entrega não está mais disponível. Escolha outra." }
  }

  const shippingCost = cents(option.price)

  let discount = 0
  let couponCode: string | null = null
  const rawCoupon = clean(body.couponCode)
  if (rawCoupon) {
    if (!validateCoupon) return { ok: false, error: "Cupom indisponível no momento." }
    const result = await validateCoupon(rawCoupon, items.value.subtotal)
    if (!result.ok) return { ok: false, error: result.error }
    discount = result.discount
    couponCode = result.code
  }

  return {
    ok: true,
    value: {
      customer: { name, email, phone },
      address,
      shipping: { optionId: option.id, label: option.label, days: option.days },
      lines: items.value.lines,
      subtotal: items.value.subtotal,
      shippingCost,
      discount,
      couponCode,
      total: cents(items.value.subtotal + shippingCost - discount),
    },
  }
}
