import { metricService }    from "./metric"
import { metricRepository } from "./repositories/metric"

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export const forecastService = {

  async predictMonthEnd(tenantId: number, year: number, month: number) {
    const summary       = await metricService.executiveSummary(tenantId, year, month)
    const pending       = await metricRepository.pendingPipeline(tenantId)
    const pipelineValue = pending.reduce((s, q) => s + (q.total ?? 0), 0)
    const winRate       = summary.winRate / 100

    return {
      closedSoFar:   summary.totalRevenue,
      pipelineValue: round2(pipelineValue),
      forecast: {
        bearish: round2(summary.totalRevenue + pipelineValue * winRate * 0.6),
        base:    round2(summary.totalRevenue + pipelineValue * winRate),
        bullish: round2(summary.totalRevenue + pipelineValue * winRate * 1.4),
      },
    }
  },
}
