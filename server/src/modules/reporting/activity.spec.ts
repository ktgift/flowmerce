import { describe, it, expect, vi, beforeEach } from "vitest"
import { activityService }       from "./activity"
import { activityRepository }    from "./repositories/activity"
import { reportCacheRepository } from "./repositories/report-cache"

vi.mock("./repositories/activity")
vi.mock("./repositories/report-cache")

describe("activityService.log", () => {

  beforeEach(() => vi.clearAllMocks())

  it("log แล้ว invalidate cache", async () => {
    vi.mocked(activityRepository.log).mockResolvedValue({} as any)
    vi.mocked(reportCacheRepository.invalidateTenant).mockResolvedValue(undefined)

    await activityService.log(1, {
      userId: 1, activityType: "quote_created",
      entityType: "quotation", entityId: 10,
      value: 1000, metadata: null,
    })

    expect(activityRepository.log).toHaveBeenCalledOnce()
    expect(reportCacheRepository.invalidateTenant).toHaveBeenCalledWith(1)
  })

  it("ถ้า invalidate cache fail ไม่ throw", async () => {
    vi.mocked(activityRepository.log).mockResolvedValue({} as any)
    vi.mocked(reportCacheRepository.invalidateTenant)
      .mockRejectedValue(new Error("db locked"))

    await expect(activityService.log(1, {
      userId: null, activityType: "x",
      entityType: null, entityId: null,
      value: null, metadata: null,
    })).resolves.not.toThrow()
  })
})

describe("activityService.quoteStatusChanged", () => {

  beforeEach(() => vi.clearAllMocks())

  it("map status → activityType ถูก", async () => {
    vi.mocked(activityRepository.log).mockResolvedValue({} as any)
    vi.mocked(reportCacheRepository.invalidateTenant).mockResolvedValue(undefined)

    await activityService.quoteStatusChanged(1, 10, "sent", "approved", 5000)

    expect(activityRepository.log).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        activityType: "deal_won",
        entityType:   "quotation",
        entityId:     10,
        value:        5000,
        metadata:     { oldStatus: "sent", newStatus: "approved" },
      }),
    )
  })

  it("unknown status → quote_status_changed", async () => {
    vi.mocked(activityRepository.log).mockResolvedValue({} as any)
    vi.mocked(reportCacheRepository.invalidateTenant).mockResolvedValue(undefined)

    await activityService.quoteStatusChanged(1, 5, "draft", "cancelled", 0)

    expect(activityRepository.log).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ activityType: "quote_status_changed" }),
    )
  })
})

describe("activityService.poStatusChanged", () => {

  beforeEach(() => vi.clearAllMocks())

  it("map po status → activityType ถูก", async () => {
    vi.mocked(activityRepository.log).mockResolvedValue({} as any)
    vi.mocked(reportCacheRepository.invalidateTenant).mockResolvedValue(undefined)

    await activityService.poStatusChanged(1, 20, "approved", "received")

    expect(activityRepository.log).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        activityType: "po_received",
        entityType:   "purchase_order",
        entityId:     20,
      }),
    )
  })
})
