import { describe, it, expect, vi, beforeEach } from "vitest"
import { metricService } from "./metric"
import { metricRepository } from "./repositories/metric"

vi.mock("./repositories/metric")

describe("metricService.executiveSummary", () => {

  beforeEach(() => vi.clearAllMocks())

  it("คำนวณ winRate จาก approved/all ได้ถูก", async () => {
    vi.mocked(metricRepository.approvedInRange).mockResolvedValue([
      { total: 1000 } as any,
      { total: 2000 } as any,
    ])
    vi.mocked(metricRepository.allInRange).mockResolvedValue([
      { total: 1000 } as any, { total: 2000 } as any,
      { total: 500  } as any, { total: 800  } as any,
    ])

    const r = await metricService.executiveSummary(1, 2026, 10)

    expect(r.totalRevenue).toBe(3000)
    expect(r.dealCount).toBe(2)
    expect(r.quoteCount).toBe(4)
    expect(r.winRate).toBe(50)
    expect(r.avgDealSize).toBe(1500)
  })

  it("winRate = 0 ถ้าไม่มี quote", async () => {
    vi.mocked(metricRepository.approvedInRange).mockResolvedValue([])
    vi.mocked(metricRepository.allInRange).mockResolvedValue([])

    const r = await metricService.executiveSummary(1, 2026, 10)
    expect(r.winRate).toBe(0)
    expect(r.avgDealSize).toBe(0)
  })

  it("จัดการ null total ได้", async () => {
    vi.mocked(metricRepository.approvedInRange).mockResolvedValue([
      { total: null } as any,
      { total: 100  } as any,
    ])
    vi.mocked(metricRepository.allInRange).mockResolvedValue([
      { total: null } as any, { total: 100 } as any,
    ])
    const r = await metricService.executiveSummary(1, 2026, 10)
    expect(r.totalRevenue).toBe(100)
  })
})

describe("metricService.kpiComparison", () => {
  it("คำนวณ MoM/YoY growth ถูกต้อง", async () => {
    vi.mocked(metricRepository.approvedInRange)
      .mockResolvedValueOnce([{ total: 200 } as any])
      .mockResolvedValueOnce([{ total: 100 } as any])
      .mockResolvedValueOnce([{ total: 250 } as any])
    vi.mocked(metricRepository.allInRange)
      .mockResolvedValue([{ total: 0 } as any])

    const r = await metricService.kpiComparison(1, 2026, 10)
    expect(r.momGrowth).toBe(100)   // 200 vs 100 = +100%
    expect(r.yoyGrowth).toBe(-20)   // 200 vs 250 = -20%
  })
})

describe("periodRange", () => {
  it("month range ถูกต้อง", async () => {
    const { periodRange } = await import("./metric")
    const p = periodRange(2026, 10)
    expect(p.start).toBe("2026-10-01")
    expect(p.end).toBe("2026-11-01")
  })

  it("ข้าม December boundary ได้", async () => {
    const { periodRange } = await import("./metric")
    const p = periodRange(2026, 12)
    expect(p.start).toBe("2026-12-01")
    expect(p.end).toBe("2027-01-01")
  })
})
