import { db } from "../../../db"
import { activityLog } from "../../../db/schema/core"
import { eq, and, gte, lte, desc, sql } from "drizzle-orm"

export type ActivityRow    = typeof activityLog.$inferSelect
export type ActivityInsert = typeof activityLog.$inferInsert

export type ActivityValues =
  Omit<ActivityInsert, "id" | "tenantId" | "occurredAt">

export interface ActivityFilter {
  activityType?: string
  entityType?:   string
  entityId?:     number
  userId?:       number
  start?:        string
  end?:          string
}

export const activityRepository = {

  async log(tenantId: number, entry: ActivityValues): Promise<ActivityRow> {
    const [row] = await db.insert(activityLog)
      .values({ ...entry, tenantId })
      .returning()
    return row
  },

  async findAll(
    tenantId: number,
    filter: ActivityFilter = {},
    limit = 100,
  ): Promise<ActivityRow[]> {
    const conditions = [eq(activityLog.tenantId, tenantId)]
    if (filter.activityType) conditions.push(eq(activityLog.activityType, filter.activityType))
    if (filter.entityType)   conditions.push(eq(activityLog.entityType,   filter.entityType))
    if (filter.entityId)     conditions.push(eq(activityLog.entityId,     filter.entityId))
    if (filter.userId)       conditions.push(eq(activityLog.userId,       filter.userId))
    if (filter.start)        conditions.push(gte(activityLog.occurredAt,  filter.start))
    if (filter.end)          conditions.push(lte(activityLog.occurredAt,  filter.end))

    return db.query.activityLog.findMany({
      where:   and(...conditions),
      orderBy: [desc(activityLog.occurredAt)],
      limit,
    })
  },

  async findLastByEntity(
    tenantId: number,
    entityType: string,
    entityId: number,
  ): Promise<ActivityRow | null> {
    return await db.query.activityLog.findFirst({
      where: and(
        eq(activityLog.tenantId,   tenantId),
        eq(activityLog.entityType, entityType),
        eq(activityLog.entityId,   entityId),
      ),
      orderBy: [desc(activityLog.occurredAt)],
    }) ?? null
  },

  async heatmap(
    tenantId: number,
    start: string,
    end: string,
  ): Promise<Array<{ day: string; activityType: string; count: number }>> {
    return db
      .select({
        day:          sql<string>`date(${activityLog.occurredAt})`,
        activityType: activityLog.activityType,
        count:        sql<number>`COUNT(*)`,
      })
      .from(activityLog)
      .where(and(
        eq(activityLog.tenantId,   tenantId),
        gte(activityLog.occurredAt, start),
        lte(activityLog.occurredAt, end),
      ))
      .groupBy(sql`date(${activityLog.occurredAt})`, activityLog.activityType)
  },
}

export type ActivityRepository = typeof activityRepository
