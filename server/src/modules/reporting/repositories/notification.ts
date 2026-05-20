import { db } from "../../../db"
import { notifications } from "../../../db/schema/core"
import { eq, and, desc, sql, count } from "drizzle-orm"

export type NotificationRow    = typeof notifications.$inferSelect
export type NotificationInsert = typeof notifications.$inferInsert

export type NotificationValues =
  Omit<NotificationInsert, "id" | "tenantId" | "isRead" | "readAt" | "createdAt">

const nowSql = () => sql`(datetime('now'))`

export const notificationRepository = {

  async create(tenantId: number, values: NotificationValues): Promise<NotificationRow> {
    const [row] = await db.insert(notifications)
      .values({ ...values, tenantId })
      .returning()
    return row
  },

  async createMany(tenantId: number, items: NotificationValues[]): Promise<void> {
    if (items.length === 0) return
    await db.insert(notifications).values(
      items.map(v => ({ ...v, tenantId })),
    )
  },

  async findAll(
    tenantId: number,
    opts: { onlyUnread?: boolean; limit?: number; userId?: number | null } = {},
  ): Promise<NotificationRow[]> {
    const conditions = [eq(notifications.tenantId, tenantId)]
    if (opts.onlyUnread) conditions.push(eq(notifications.isRead, false))
    if (opts.userId != null) conditions.push(eq(notifications.userId, opts.userId))

    return db.query.notifications.findMany({
      where:   and(...conditions),
      orderBy: [desc(notifications.createdAt)],
      limit:   opts.limit ?? 50,
    })
  },

  async countUnread(tenantId: number, userId?: number | null): Promise<number> {
    const conditions = [
      eq(notifications.tenantId, tenantId),
      eq(notifications.isRead,   false),
    ]
    if (userId != null) conditions.push(eq(notifications.userId, userId))
    const [row] = await db.select({ value: count() })
      .from(notifications)
      .where(and(...conditions))
    return row?.value ?? 0
  },

  async markRead(tenantId: number, id: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true, readAt: nowSql() })
      .where(and(
        eq(notifications.tenantId, tenantId),
        eq(notifications.id,       id),
      ))
  },

  async markAllRead(tenantId: number, userId?: number | null): Promise<void> {
    const conditions = [
      eq(notifications.tenantId, tenantId),
      eq(notifications.isRead,   false),
    ]
    if (userId != null) conditions.push(eq(notifications.userId, userId))
    await db.update(notifications)
      .set({ isRead: true, readAt: nowSql() })
      .where(and(...conditions))
  },

  async existsRecent(
    tenantId: number,
    type: string,
    entityType: string,
    entityId: number,
    withinHours = 24,
  ): Promise<boolean> {
    const cutoff = new Date(Date.now() - withinHours * 3600 * 1000).toISOString()
    const row = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.tenantId,   tenantId),
        eq(notifications.type,       type),
        eq(notifications.entityType, entityType),
        eq(notifications.entityId,   entityId),
        sql`${notifications.createdAt} > ${cutoff}`,
      ),
    })
    return !!row
  },
}

export type NotificationRepository = typeof notificationRepository
