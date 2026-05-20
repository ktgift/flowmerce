import { db } from "../../../db"
import { quoteLossReasons } from "../../../db/schema/core"
import { eq, and, gte, lte, sql, desc } from "drizzle-orm"

export type LossReasonRow    = typeof quoteLossReasons.$inferSelect
export type LossReasonInsert = typeof quoteLossReasons.$inferInsert

export type LossReasonValues =
  Omit<LossReasonInsert, "id" | "tenantId" | "lostAt">

export const lossReasonRepository = {

  async record(tenantId: number, values: LossReasonValues): Promise<LossReasonRow> {
    const [row] = await db.insert(quoteLossReasons)
      .values({ ...values, tenantId })
      .returning()
    return row
  },

  async findByQuote(tenantId: number, quotationId: number): Promise<LossReasonRow[]> {
    return db.query.quoteLossReasons.findMany({
      where: and(
        eq(quoteLossReasons.tenantId,    tenantId),
        eq(quoteLossReasons.quotationId, quotationId),
      ),
      orderBy: [desc(quoteLossReasons.lostAt)],
    })
  },

  async analysis(
    tenantId: number,
    start: string,
    end: string,
  ): Promise<Array<{ reasonType: string | null; count: number }>> {
    return db
      .select({
        reasonType: quoteLossReasons.reasonType,
        count:      sql<number>`COUNT(*)`,
      })
      .from(quoteLossReasons)
      .where(and(
        eq(quoteLossReasons.tenantId, tenantId),
        gte(quoteLossReasons.lostAt,  start),
        lte(quoteLossReasons.lostAt,  end),
      ))
      .groupBy(quoteLossReasons.reasonType)
  },
}

export type LossReasonRepository = typeof lossReasonRepository
