import { activityRepository, type ActivityValues } from "./repositories/activity"
import { reportCacheRepository }                   from "./repositories/report-cache"

export const activityService = {

  async log(tenantId: number, entry: ActivityValues): Promise<void> {
    await activityRepository.log(tenantId, entry)
    // best-effort — cache invalidation failure must not break business flow
    reportCacheRepository.invalidateTenant(tenantId).catch(() => {})
  },

  async quoteCreated(tenantId: number, quotationId: number, value: number, userId?: number) {
    return this.log(tenantId, {
      userId:       userId ?? null,
      activityType: "quote_created",
      entityType:   "quotation",
      entityId:     quotationId,
      value,
      metadata:     null,
    })
  },

  async quoteStatusChanged(
    tenantId:  number,
    quotationId: number,
    oldStatus: string,
    newStatus: string,
    value:     number,
    userId?:   number,
  ) {
    const map: Record<string, string> = {
      sent:     "quote_sent",
      approved: "deal_won",
      lost:     "deal_lost",
      expired:  "quote_expired",
    }
    return this.log(tenantId, {
      userId:       userId ?? null,
      activityType: map[newStatus] ?? "quote_status_changed",
      entityType:   "quotation",
      entityId:     quotationId,
      value,
      metadata:     { oldStatus, newStatus },
    })
  },

  async poCreated(tenantId: number, poId: number, value: number, userId?: number) {
    return this.log(tenantId, {
      userId:       userId ?? null,
      activityType: "po_created",
      entityType:   "purchase_order",
      entityId:     poId,
      value,
      metadata:     null,
    })
  },

  async poStatusChanged(
    tenantId:  number,
    poId:      number,
    oldStatus: string,
    newStatus: string,
    userId?:   number,
  ) {
    const map: Record<string, string> = {
      approved:  "po_approved",
      received:  "po_received",
      cancelled: "po_cancelled",
    }
    return this.log(tenantId, {
      userId:       userId ?? null,
      activityType: map[newStatus] ?? "po_status_changed",
      entityType:   "purchase_order",
      entityId:     poId,
      value:        null,
      metadata:     { oldStatus, newStatus },
    })
  },
}

export type ActivityService = typeof activityService
