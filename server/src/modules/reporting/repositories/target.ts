import { db } from "../../../db"
import { salesTargets } from "../../../db/schema/core"
import { eq, and, sql } from "drizzle-orm"

export type TargetRow    = typeof salesTargets.$inferSelect
export type TargetInsert = typeof salesTargets.$inferInsert

export type TargetValues =
  Omit<TargetInsert, "id" | "tenantId" | "createdAt" | "updatedAt">

const nowSql = () => sql`(datetime('now'))`

export const targetRepository = {

  async findOne(
    tenantId: number,
    periodKey: string,
    metricType: string,
    userId?: number | null,
  ): Promise<TargetRow | null> {
    return await db.query.salesTargets.findFirst({
      where: and(
        eq(salesTargets.tenantId,   tenantId),
        eq(salesTargets.periodKey,  periodKey),
        eq(salesTargets.metricType, metricType),
        userId == null
          ? sql`${salesTargets.userId} IS NULL`
          : eq(salesTargets.userId, userId),
      ),
    }) ?? null
  },

  async findByPeriod(tenantId: number, periodKey: string): Promise<TargetRow[]> {
    return db.query.salesTargets.findMany({
      where: and(
        eq(salesTargets.tenantId,  tenantId),
        eq(salesTargets.periodKey, periodKey),
      ),
    })
  },

  async upsert(tenantId: number, values: TargetValues): Promise<TargetRow> {
    const existing = await this.findOne(
      tenantId, values.periodKey, values.metricType, values.userId,
    )
    if (existing) {
      const [updated] = await db.update(salesTargets)
        .set({ targetValue: values.targetValue, updatedAt: nowSql() })
        .where(eq(salesTargets.id, existing.id))
        .returning()
      return updated
    }
    const [row] = await db.insert(salesTargets)
      .values({ ...values, tenantId })
      .returning()
    return row
  },

  async remove(tenantId: number, id: number): Promise<void> {
    await db.delete(salesTargets).where(and(
      eq(salesTargets.tenantId, tenantId),
      eq(salesTargets.id,       id),
    ))
  },
}

export type TargetRepository = typeof targetRepository
