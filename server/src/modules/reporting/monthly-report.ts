import { metricService }         from "./metric"
import { narrativeService }      from "./narrative"
import { forecastService }       from "./forecast"
import { reportCacheRepository } from "./repositories/report-cache"

export const monthlyReportService = {

  async generate(
    tenantId: number,
    year: number,
    month: number,
    opts: { fresh?: boolean } = {},
  ) {
    const cacheKey = `monthly:${year}-${String(month).padStart(2, "0")}`

    if (!opts.fresh) {
      const cached = await reportCacheRepository.get(tenantId, cacheKey)
      if (cached) return cached
    }

    const [summary, kpiComparison, topCustomers, topProducts, revenueTrend, pipeline] =
      await Promise.all([
        metricService.executiveSummary(tenantId, year, month),
        metricService.kpiComparison(tenantId, year, month),
        metricService.topCustomers(tenantId, year, month, 10),
        metricService.topProducts(tenantId, year, month, 10),
        metricService.revenueTrend(tenantId, year, month, 12),
        metricService.pipelineFunnel(tenantId, year, month),
      ])

    const period = `${year}-${String(month).padStart(2, "0")}`
    const [narrative, forecast] = await Promise.all([
      narrativeService.executiveBrief({ period, summary, kpiComparison, topCustomers, pipeline }),
      forecastService.predictMonthEnd(tenantId, year, month),
    ])

    const result = {
      meta: { period, year, month, generatedAt: new Date().toISOString() },
      summary, kpiComparison, topCustomers, topProducts,
      revenueTrend, pipeline, narrative, forecast,
    }

    const now           = new Date()
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
    const ttl           = isCurrentMonth ? 6 * 3600 : 7 * 24 * 3600
    await reportCacheRepository.set(tenantId, cacheKey, result, ttl)

    return result
  },
}
