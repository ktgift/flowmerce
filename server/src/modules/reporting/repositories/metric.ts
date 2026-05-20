import { db } from "../../../db"
import { quotations, quotationItems, customers } from "../../../db/schema/core"
import { and, eq, gte, lte, isNull, sql, desc, inArray } from "drizzle-orm"

export type QuoteRow = typeof quotations.$inferSelect

export interface MetricPeriod {
  start: string   // ISO date "2026-10-01"
  end:   string   // ISO date "2026-11-01" (exclusive)
}

export interface TopCustomerRow {
  customerId: number | null
  name:       string
  revenue:    number
  dealCount:  number
}

export interface TopProductRow {
  name:     string
  sku:      string | null
  quantity: number
  revenue:  number
}

export interface FunnelRow {
  status: string
  count:  number
  value:  number
}

export const metricRepository = {

  async approvedInRange(tenantId: number, p: MetricPeriod): Promise<QuoteRow[]> {
    return db.query.quotations.findMany({
      where: and(
        eq(quotations.tenantId, tenantId),
        eq(quotations.status,   "approved"),
        gte(quotations.createdAt, p.start),
        lte(quotations.createdAt, p.end),
      ),
    })
  },

  async allInRange(tenantId: number, p: MetricPeriod): Promise<QuoteRow[]> {
    return db.query.quotations.findMany({
      where: and(
        eq(quotations.tenantId,  tenantId),
        gte(quotations.createdAt, p.start),
        lte(quotations.createdAt, p.end),
      ),
    })
  },

  async pendingPipeline(tenantId: number): Promise<QuoteRow[]> {
    return db.query.quotations.findMany({
      where: and(
        eq(quotations.tenantId, tenantId),
        inArray(quotations.status, ["draft", "sent"]),
      ),
    })
  },

  async topCustomers(
    tenantId: number,
    p: MetricPeriod,
    limit = 10,
  ): Promise<TopCustomerRow[]> {
    const rows = await db
      .select({
        customerId: quotations.customerId,
        name:       customers.name,
        revenue:    sql<number>`SUM(${quotations.total})`,
        dealCount:  sql<number>`COUNT(*)`,
      })
      .from(quotations)
      .leftJoin(customers, eq(customers.id, quotations.customerId))
      .where(and(
        eq(quotations.tenantId,   tenantId),
        eq(quotations.status,     "approved"),
        gte(quotations.createdAt, p.start),
        lte(quotations.createdAt, p.end),
      ))
      .groupBy(quotations.customerId, customers.name)
      .orderBy(desc(sql`SUM(${quotations.total})`))
      .limit(limit)

    return rows.map(r => ({
      customerId: r.customerId,
      name:       r.name ?? "(ไม่ระบุ)",
      revenue:    r.revenue  ?? 0,
      dealCount:  r.dealCount ?? 0,
    }))
  },

  async topProducts(
    tenantId: number,
    p: MetricPeriod,
    limit = 10,
  ): Promise<TopProductRow[]> {
    const rows = await db
      .select({
        name:     quotationItems.productName,
        quantity: sql<number>`SUM(${quotationItems.qty})`,
        revenue:  sql<number>`SUM(${quotationItems.lineTotal})`,
      })
      .from(quotationItems)
      .innerJoin(quotations, eq(quotationItems.quotationId, quotations.id))
      .where(and(
        eq(quotations.tenantId,   tenantId),
        eq(quotations.status,     "approved"),
        gte(quotations.createdAt, p.start),
        lte(quotations.createdAt, p.end),
      ))
      .groupBy(quotationItems.productName)
      .orderBy(desc(sql`SUM(${quotationItems.lineTotal})`))
      .limit(limit)

    return rows.map(r => ({
      name:     r.name,
      sku:      null,
      quantity: r.quantity ?? 0,
      revenue:  r.revenue  ?? 0,
    }))
  },

  async pipelineFunnel(
    tenantId: number,
    p: MetricPeriod,
  ): Promise<FunnelRow[]> {
    const rows = await db
      .select({
        status: quotations.status,
        count:  sql<number>`COUNT(*)`,
        value:  sql<number>`SUM(${quotations.total})`,
      })
      .from(quotations)
      .where(and(
        eq(quotations.tenantId,   tenantId),
        gte(quotations.createdAt, p.start),
        lte(quotations.createdAt, p.end),
      ))
      .groupBy(quotations.status)

    return rows.map(r => ({
      status: r.status,
      count:  r.count ?? 0,
      value:  r.value ?? 0,
    }))
  },
}

export type MetricRepository = typeof metricRepository
