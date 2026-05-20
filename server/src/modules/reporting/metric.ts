import { metricRepository, type MetricPeriod } from "./repositories/metric"

export function periodRange(year: number, month?: number): MetricPeriod {
  if (month) {
    const start    = `${year}-${String(month).padStart(2, "0")}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear  = month === 12 ? year + 1 : year
    const end      = `${endYear}-${String(endMonth).padStart(2, "0")}-01`
    return { start, end }
  }
  return { start: `${year}-01-01`, end: `${year + 1}-01-01` }
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export const metricService = {

  async executiveSummary(tenantId: number, year: number, month?: number) {
    const p = periodRange(year, month)
    const [approved, all] = await Promise.all([
      metricRepository.approvedInRange(tenantId, p),
      metricRepository.allInRange(tenantId, p),
    ])

    const totalRevenue = approved.reduce((s, q) => s + (q.total ?? 0), 0)
    const dealCount    = approved.length
    const quoteCount   = all.length
    const winRate      = quoteCount > 0 ? (dealCount / quoteCount) * 100 : 0
    const avgDealSize  = dealCount > 0 ? totalRevenue / dealCount : 0

    return {
      totalRevenue: round2(totalRevenue),
      dealCount,
      quoteCount,
      winRate:      round2(winRate),
      avgDealSize:  round2(avgDealSize),
    }
  },

  async kpiComparison(tenantId: number, year: number, month: number) {
    const current   = await this.executiveSummary(tenantId, year, month)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear  = month === 1 ? year - 1 : year
    const previous  = await this.executiveSummary(tenantId, prevYear, prevMonth)
    const lastYear  = await this.executiveSummary(tenantId, year - 1, month)

    const pct = (cur: number, base: number) =>
      base > 0 ? round2(((cur - base) / base) * 100) : 0

    return {
      current,
      previous,
      lastYear,
      momGrowth: pct(current.totalRevenue, previous.totalRevenue),
      yoyGrowth: pct(current.totalRevenue, lastYear.totalRevenue),
    }
  },

  async topCustomers(tenantId: number, year: number, month: number | undefined, limit = 10) {
    const p    = periodRange(year, month)
    const rows = await metricRepository.topCustomers(tenantId, p, limit)
    return rows.map(r => ({
      customerId: r.customerId,
      name:       r.name,
      revenue:    round2(r.revenue),
      dealCount:  r.dealCount,
    }))
  },

  async topProducts(tenantId: number, year: number, month: number | undefined, limit = 10) {
    const p    = periodRange(year, month)
    const rows = await metricRepository.topProducts(tenantId, p, limit)
    return rows.map(r => ({
      name:     r.name,
      sku:      r.sku,
      quantity: round2(r.quantity),
      revenue:  round2(r.revenue),
    }))
  },

  async revenueTrend(tenantId: number, year: number, month: number, monthsBack = 12) {
    const trend = []
    let y = year, m = month
    for (let i = 0; i < monthsBack; i++) {
      const summary = await this.executiveSummary(tenantId, y, m)
      trend.unshift({
        period:  `${y}-${String(m).padStart(2, "0")}`,
        revenue: summary.totalRevenue,
      })
      m--
      if (m === 0) { m = 12; y-- }
    }
    return trend
  },

  async pipelineFunnel(tenantId: number, year: number, month?: number) {
    const p    = periodRange(year, month)
    const rows = await metricRepository.pipelineFunnel(tenantId, p)
    return rows.map(r => ({
      status: r.status,
      count:  r.count,
      value:  round2(r.value),
    }))
  },
}
