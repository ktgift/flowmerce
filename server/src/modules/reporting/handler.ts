import { Elysia, t }               from "elysia"
import { tenantMiddleware }        from "../../middleware/tenant"
import { monthlyReportService }    from "./monthly-report"
import { metricService }           from "./metric"
import { notificationService }     from "./notification"
import { targetRepository }        from "./repositories/target"
import { reportCacheRepository }   from "./repositories/report-cache"
import { lossReasonRepository }    from "./repositories/loss-reason"

export const reportRoute = new Elysia({ prefix: "/reports" })
  .use(tenantMiddleware)

  .get("/dashboard", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : now.getMonth() + 1
    const data = {
      summary:      await metricService.executiveSummary(tenantId, year, month),
      revenueTrend: await metricService.revenueTrend(tenantId, year, month, 6),
      pipeline:     await metricService.pipelineFunnel(tenantId, year, month),
    }
    return { success: true, data }
  })

  .get("/monthly", async ({ tenantId, query }: any) => {
    const year  = Number(query.year)
    const month = Number(query.month)
    const fresh = query.fresh === "1"
    const data = await monthlyReportService.generate(tenantId, year, month, { fresh })
    return { success: true, data }
  })

  .get("/kpi", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : now.getMonth() + 1
    const data = await metricService.kpiComparison(tenantId, year, month)
    return { success: true, data }
  })

  .get("/top-customers", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : undefined
    const data = await metricService.topCustomers(tenantId, year, month, Number(query.limit ?? 10))
    return { success: true, data }
  })

  .get("/top-products", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : undefined
    const data = await metricService.topProducts(tenantId, year, month, Number(query.limit ?? 10))
    return { success: true, data }
  })

  .get("/forecast", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const year  = query.year  ? Number(query.year)  : now.getFullYear()
    const month = query.month ? Number(query.month) : now.getMonth() + 1
    const { forecastService } = await import("./forecast")
    const data = await forecastService.predictMonthEnd(tenantId, year, month)
    return { success: true, data }
  })

  .get("/targets/:periodKey", async ({ tenantId, params }: any) => {
    const data = await targetRepository.findByPeriod(tenantId, params.periodKey)
    return { success: true, data }
  })

  .put("/targets", async ({ tenantId, body }: any) => {
    const v = body as any
    const data = await targetRepository.upsert(tenantId, {
      userId:      v.userId ?? null,
      periodType:  v.periodType,
      periodKey:   v.periodKey,
      metricType:  v.metricType,
      targetValue: Number(v.targetValue),
    })
    return { success: true, data }
  })

  .delete("/targets/:id", async ({ tenantId, params, set }: any) => {
    await targetRepository.remove(tenantId, Number(params.id))
    set.status = 204
  })

  .get("/loss-analysis", async ({ tenantId, query }: any) => {
    const now   = new Date()
    const start = query.start ?? `${now.getFullYear()}-01-01`
    const end   = query.end   ?? new Date().toISOString().slice(0, 10)
    const data = await lossReasonRepository.analysis(tenantId, start, end)
    return { success: true, data }
  })

  .post("/loss-reasons", async ({ tenantId, body }: any) => {
    const v = body as any
    const data = await lossReasonRepository.record(tenantId, {
      quotationId:    v.quotationId,
      reasonType:     v.reasonType,
      competitorName: v.competitorName,
      notes:          v.notes,
    })
    return { success: true, data }
  })

  .post("/cache/invalidate", async ({ tenantId }: any) => {
    await reportCacheRepository.invalidateTenant(tenantId)
    return { success: true }
  })

export const notificationRoute = new Elysia({ prefix: "/notifications" })
  .use(tenantMiddleware)

  .get("/", async ({ tenantId, query }: any) => {
    const data = await notificationService.list(tenantId, { onlyUnread: query.unread === "1" })
    return { success: true, data }
  })

  .get("/unread-count", async ({ tenantId }: any) => {
    const data = await notificationService.unreadCount(tenantId)
    return { success: true, data }
  })

  .patch("/:id/read", async ({ tenantId, params }: any) => {
    const data = await notificationService.markRead(tenantId, Number(params.id))
    return { success: true, data }
  })

  .post("/mark-all-read", async ({ tenantId }: any) => {
    await notificationService.markAllRead(tenantId)
    return { success: true }
  })
