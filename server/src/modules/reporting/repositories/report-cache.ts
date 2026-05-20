import { db } from "../../../db"
import { reportCache } from "../../../db/schema/core"
import { eq, and, lte, sql } from "drizzle-orm"

export type ReportCacheRow = typeof reportCache.$inferSelect

const nowSql = () => sql`(datetime('now'))`

export const reportCacheRepository = {

  async get(tenantId: number, cacheKey: string): Promise<any | null> {
    const row = await db.query.reportCache.findFirst({
      where: and(
        eq(reportCache.tenantId,  tenantId),
        eq(reportCache.cacheKey,  cacheKey),
      ),
    })
    if (!row) return null
    if (row.expiresAt && row.expiresAt < new Date().toISOString()) return null
    return row.data
  },

  async set(
    tenantId: number,
    cacheKey: string,
    data: any,
    ttlSeconds: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
    const existing = await db.query.reportCache.findFirst({
      where: and(
        eq(reportCache.tenantId, tenantId),
        eq(reportCache.cacheKey, cacheKey),
      ),
    })
    if (existing) {
      await db.update(reportCache)
        .set({ data, expiresAt, computedAt: nowSql() })
        .where(eq(reportCache.id, existing.id))
    } else {
      await db.insert(reportCache).values({ tenantId, cacheKey, data, expiresAt })
    }
  },

  async sweepExpired(): Promise<number> {
    const result = await db.delete(reportCache)
      .where(lte(reportCache.expiresAt, new Date().toISOString()))
    return (result as any).changes ?? 0
  },

  async invalidateTenant(tenantId: number): Promise<void> {
    await db.delete(reportCache).where(eq(reportCache.tenantId, tenantId))
  },
}

export type ReportCacheRepository = typeof reportCacheRepository
