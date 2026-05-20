import { Elysia }                from "elysia"
import { tenantMiddleware }     from "../../middleware/tenant"
import { monthlyReportService } from "./monthly-report"
import { metricService }        from "./metric"
import { notificationService }  from "./notification"
import { targetRepository }     from "./repositories/target"
import { reportCacheRepository } from "./repositories/report-cache"
import { lossReasonRepository } from "./repositories/loss-reason"

export const reportRoute = new Elysia({ prefix: "/reports" })
  .use(tenantMiddleware)

  .get("/dashboard", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : now.getMonth() + 1
    return {
      summary:      await metricService.executiveSummary(tenantId, year, month),
      revenueTrend: await metricService.revenueTrend(tenantId, year, month, 6),
      pipeline:     await metricService.pipelineFunnel(tenantId, year, month),
    }
  })

  .get("/monthly", ({ tenantId, query }: any) => {
    const year  = Number(query.year)
    const month = Number(query.month)
    const fresh = query.fresh === "1"
    return monthlyReportService.generate(tenantId, year, month, { fresh })
  })

  .get("/kpi", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : now.getMonth() + 1
    return metricService.kpiComparison(tenantId, year, month)
  })

  .get("/top-customers", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : undefined
    return metricService.topCustomers(tenantId, year, month, Number(query.limit ?? 10))
  })

  .get("/top-products", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : undefined
    return metricService.topProducts(tenantId, year, month, Number(query.limit ?? 10))
  })

  .get("/forecast", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : now.getMonth() + 1
    const { forecastService } = await import("./forecast")
    return forecastService.predictMonthEnd(tenantId, year, month)
  })

  // Sales Targets
  .get("/targets/:periodKey", ({ tenantId, params }: any) =>
    targetRepository.findByPeriod(tenantId, params.periodKey),
  )
  .put("/targets", ({ tenantId, body }: any) => {
    const v = body as any
    return targetRepository.upsert(tenantId, {
      userId:      v.userId ?? null,
      periodType:  v.periodType,
      periodKey:   v.periodKey,
      metricType:  v.metricType,
      targetValue: Number(v.targetValue),
    })
  })
  .delete("/targets/:id", ({ tenantId, params }: any) =>
    targetRepository.remove(tenantId, Number(params.id)),
  )

  // Loss reason analysis
  .get("/loss-analysis", ({ tenantId, query }: any) => {
    const now   = new Date()
    const start = query.start ?? `${now.getFullYear()}-01-01`
    const end   = query.end   ?? new Date().toISOString().slice(0, 10)
    return lossReasonRepository.analysis(tenantId, start, end)
  })
  .post("/loss-reasons", ({ tenantId, body }: any) => {
    const v = body as any
    return lossReasonRepository.record(tenantId, {
      quotationId:    v.quotationId,
      reasonType:     v.reasonType,
      competitorName: v.competitorName,
      notes:          v.notes,
    })
  })

  // Cache invalidation (admin)
  .post("/cache/invalidate", async ({ tenantId }: any) => {
    await reportCacheRepository.invalidateTenant(tenantId)
    return { ok: true }
  })

export const notificationRoute = new Elysia({ prefix: "/notifications" })
  .use(tenantMiddleware)

  .get("/", ({ tenantId, query }: any) =>
    notificationService.list(tenantId, {
      onlyUnread: query.unread === "1",
    }),
  )

  .get("/unread-count", async ({ tenantId }: any) => ({
    count: await notificationService.unreadCount(tenantId),
  }))

  .patch("/:id/read", ({ tenantId, params }: any) =>
    notificationService.markRead(tenantId, Number(params.id)),
  )

  .post("/mark-all-read", ({ tenantId }: any) =>
    notificationService.markAllRead(tenantId),
  )
