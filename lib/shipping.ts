import { packageByCategory, sameDayDelivery } from "@/lib/site"
import type { QuoteFn, QuoteLine, QuoteResult, ShippingOption } from "@/lib/checkout"

// Cálculo de frete (só no servidor):
// - CEP de São Luís (65000-000 a 65099-999): entrega no mesmo dia, valor fixo da loja.
// - Resto do Brasil: cotação dos Correios (PAC e SEDEX) pelo Melhor Envio, usando o CEP da loja
//   (SHIPPING_ORIGIN_CEP) e o peso/medidas de cada categoria (packageByCategory em lib/site.ts).

const BASE_URL = () => process.env.MELHORENVIO_BASE_URL || "https://melhorenvio.com.br"
const SERVICES = "1,2,3,4" // 1 = PAC, 2 = SEDEX (Correios), 3 = .Package, 4 = .Com (Jadlog)

// Nomes mais amigáveis que os da API pra alguns serviços (ex.: "Jadlog Econômico" em vez de
// "Jadlog .Package").
const SERVICE_LABEL_OVERRIDES: Record<number, string> = {
  3: "Jadlog Econômico",
  4: "Jadlog Rápido",
}

export const isShippingConfigured = () => Boolean(process.env.MELHORENVIO_TOKEN && process.env.SHIPPING_ORIGIN_CEP)

export function isSameDayCep(cep: string) {
  const n = Number(cep.replace(/\D/g, ""))
  return Number.isInteger(n) && n >= sameDayDelivery.cepFrom && n <= sameDayDelivery.cepTo
}

const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]

// "Hoje" em horário de São Luís, não do servidor (que costuma rodar em UTC).
function todayInBrazil() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Fortaleza" }))
}

function formatDeliveryDate(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  return `${WEEKDAYS[date.getDay()]} ${dd}/${mm}`
}

function addBusinessDays(date: Date, days: number) {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 0 && result.getDay() !== 6) added++
  }
  return result
}

// Pedido até esse horário sai no mesmo dia (bate com o banner "+ ENVIAMOS PARA TODO O BRASIL" da
// home); depois disso, só no dia seguinte.
const SAME_DAY_CUTOFF_HOUR = 12

function sameDayEstimate() {
  return `Pedidos realizados até às ${SAME_DAY_CUTOFF_HOUR}h são entregues no mesmo dia. O horário de entrega pode variar de acordo com a rota. Aguarde nosso contato pelo WhatsApp para mais informações.`
}

function sameDayOption(): ShippingOption {
  return {
    id: sameDayDelivery.id,
    label: sameDayDelivery.label,
    price: sameDayDelivery.price,
    days: sameDayEstimate(),
  }
}

// Cotações repetidas (mesmo CEP e mesmo carrinho) reaproveitam a resposta por 10 minutos.
const CACHE_MS = 10 * 60 * 1000
const cache = new Map<string, { at: number; options: ShippingOption[] }>()

type MelhorEnvioService = {
  id: number
  name: string
  price?: string | number
  custom_price?: string | number
  delivery_time?: number
  delivery_range?: { min?: number; max?: number }
  company?: { name?: string }
  error?: string
}

function daysLabel(service: MelhorEnvioService) {
  const { min, max } = service.delivery_range ?? {}
  const days = max ?? service.delivery_time
  if (!days) return "Prazo a confirmar"

  const today = todayInBrazil()
  if (min && max && min !== max) {
    return `Chega entre ${formatDeliveryDate(addBusinessDays(today, min))} e ${formatDeliveryDate(addBusinessDays(today, max))}`
  }
  return `Chega ${formatDeliveryDate(addBusinessDays(today, days))}`
}

async function quoteCorreios(cep: string, lines: QuoteLine[]): Promise<QuoteResult> {
  if (!isShippingConfigured()) {
    return { options: [], error: "O cálculo de frete para a sua região ainda não está disponível. Fale com a gente no Instagram." }
  }

  const products = lines.map((line) => {
    const pack = packageByCategory[line.category] ?? { weight: 0.5, width: 25, height: 8, length: 32 }
    return {
      id: line.slug,
      width: pack.width,
      height: pack.height,
      length: pack.length,
      weight: pack.weight,
      insurance_value: line.unitPrice,
      quantity: line.quantity,
    }
  })

  const key = `${cep}|${JSON.stringify(products)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return { options: hit.options }

  try {
    const res = await fetch(`${BASE_URL()}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MELHORENVIO_TOKEN}`,
        "User-Agent": `Saint Grifes (${process.env.SHIPPING_CONTACT_EMAIL || "contato"})`,
      },
      body: JSON.stringify({
        from: { postal_code: process.env.SHIPPING_ORIGIN_CEP!.replace(/\D/g, "") },
        to: { postal_code: cep },
        products,
        options: { receipt: false, own_hand: false },
        services: SERVICES,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { options: [], error: "Não foi possível calcular o frete agora. Tente de novo em instantes." }

    const data = (await res.json()) as MelhorEnvioService[]
    const options: ShippingOption[] = (Array.isArray(data) ? data : [])
      .filter((service) => !service.error && Number(service.custom_price ?? service.price) > 0)
      .map((service) => ({
        id: `me-${service.id}`,
        label: SERVICE_LABEL_OVERRIDES[service.id] ?? `${service.company?.name ?? "Correios"} ${service.name}`.trim(),
        price: Math.round(Number(service.custom_price ?? service.price) * 100) / 100,
        days: daysLabel(service),
      }))
      .sort((a, b) => a.price - b.price)

    if (options.length === 0) return { options: [], error: "Não encontramos opções de envio para esse CEP." }
    if (cache.size > 200) cache.clear()
    cache.set(key, { at: Date.now(), options })
    return { options }
  } catch {
    return { options: [], error: "Não foi possível calcular o frete agora. Tente de novo em instantes." }
  }
}

export const quoteShipping: QuoteFn = async (cepInput, lines) => {
  const cep = cepInput.replace(/\D/g, "")
  if (cep.length !== 8) return { options: [], error: "Informe um CEP válido." }

  if (!isSameDayCep(cep)) return quoteCorreios(cep, lines)

  // Em São Luís, o motoboy aparece junto com as transportadoras normais — o cliente escolhe. Se a
  // cotação das transportadoras falhar por qualquer motivo, ainda sobra o motoboy, então nunca dá erro aqui.
  const correios = await quoteCorreios(cep, lines)
  return { options: [sameDayOption(), ...correios.options] }
}
