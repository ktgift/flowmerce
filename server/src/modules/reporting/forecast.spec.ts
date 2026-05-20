import { describe, it, expect, vi, beforeEach } from "vitest"
import { forecastService }  from "./forecast"
import { metricService }    from "./metric"
import { metricRepository } from "./repositories/metric"

vi.mock("./metric")
vi.mock("./repositories/metric")

describe("forecastService.predictMonthEnd", () => {

  beforeEach(() => vi.clearAllMocks())

  it("base = closed + pipeline * winRate", async () => {
    vi.mocked(metricService.executiveSummary).mockResolvedValue({
      totalRevenue: 1000,
      dealCount: 5, quoteCount: 10,
      winRate: 50, avgDealSize: 200,
    })
    vi.mocked(metricRepository.pendingPipeline).mockResolvedValue([
      { total: 400 } as any,
      { total: 600 } as any,
    ])

    const r = await forecastService.predictMonthEnd(1, 2026, 10)
    expect(r.closedSoFar).toBe(1000)
    expect(r.pipelineValue).toBe(1000)
    // winRate 50% → base = 1000 + 1000*0.5 = 1500
    expect(r.forecast.base).toBe(1500)
    expect(r.forecast.bearish).toBe(1300)   // *0.6
    expect(r.forecast.bullish).toBe(1700)   // *1.4
  })

  it("winRate 0% → forecast = closedSoFar", async () => {
    vi.mocked(metricService.executiveSummary).mockResolvedValue({
      totalRevenue: 500,
      dealCount: 0, quoteCount: 5,
      winRate: 0, avgDealSize: 0,
    })
    vi.mocked(metricRepository.pendingPipeline).mockResolvedValue([
      { total: 1000 } as any,
    ])

    const r = await forecastService.predictMonthEnd(1, 2026, 10)
    expect(r.forecast.base).toBe(500)
    expect(r.forecast.bearish).toBe(500)
    expect(r.forecast.bullish).toBe(500)
  })
})
