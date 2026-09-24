import { listOrders, type Order, type OrderStatus } from "@/lib/orders"
import type { Period } from "@/lib/periods"

export type DayPoint = { date: string; label: string; revenue: number; orders: number }
export type StatusTotals = Record<OrderStatus, { count: number; total: number }>

export type DashboardStats = {
  unavailable: boolean
  days: Period
  revenue: number
  paidOrders: number
  averageTicket: number
  customers: number
  createdOrders: number
  conversion: number
  status: StatusTotals
  series: DayPoint[]
  previousRevenue: number
  changePercent: number | null
}

const TZ = "America/Fortaleza"
const DAY = 24 * 60 * 60 * 1000

// "2026-09-21" no fuso de São Luís.
const dayKey = (date: Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(date)
const shortLabel = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}`

const paidDate = (order: Order) => new Date(order.paidAt ?? order.createdAt)

// Tudo aqui vem dos pedidos reais gravados no banco. Sem pedidos, os números ficam zerados.
export async function getDashboardStats(days: Period, now = new Date()): Promise<DashboardStats> {
  const { orders, unavailable } = await listOrders(2000)

  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(new Date(now.getTime() - i * DAY)))
  const inPeriod = new Set(keys)

  const previousKeys = new Set<string>()
  for (let i = days * 2 - 1; i >= days; i--) previousKeys.add(dayKey(new Date(now.getTime() - i * DAY)))

  const series = new Map<string, DayPoint>(keys.map((key) => [key, { date: key, label: shortLabel(key), revenue: 0, orders: 0 }]))
  const status: StatusTotals = {
    pending: { count: 0, total: 0 },
    paid: { count: 0, total: 0 },
    failed: { count: 0, total: 0 },
    cancelled: { count: 0, total: 0 },
  }

  let revenue = 0
  let paidOrders = 0
  let createdOrders = 0
  let previousRevenue = 0
  const customers = new Set<string>()

  for (const order of orders) {
    if (inPeriod.has(dayKey(new Date(order.createdAt)))) {
      createdOrders += 1
      status[order.status].count += 1
      status[order.status].total += order.total
    }
    if (order.status !== "paid") continue
    const key = dayKey(paidDate(order))
    if (inPeriod.has(key)) {
      revenue += order.total
      paidOrders += 1
      customers.add(order.customerEmail)
      const point = series.get(key)
      if (point) {
        point.revenue += order.total
        point.orders += 1
      }
    } else if (previousKeys.has(key)) {
      previousRevenue += order.total
    }
  }

  return {
    unavailable: Boolean(unavailable),
    days,
    revenue,
    paidOrders,
    averageTicket: paidOrders > 0 ? revenue / paidOrders : 0,
    customers: customers.size,
    createdOrders,
    conversion: createdOrders > 0 ? (paidOrders / createdOrders) * 100 : 0,
    status,
    series: [...series.values()],
    previousRevenue,
    changePercent: previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : null,
  }
}
