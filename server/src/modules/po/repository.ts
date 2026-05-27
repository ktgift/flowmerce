import { db } from "../../db"
import {
  purchaseOrders, purchaseOrderItems, poReceipts, poReceiptItems,
  poHistory, poApprovals, suppliers,
} from "../../db/schema/core"
import { eq, and, isNull, desc, asc, like, sql, count, sum } from "drizzle-orm"
import type {
  PoFilter,
  PoRow, PoListRow, PoItemRow, PoReceiptRow, PoReceiptItemRow, PoHistoryRow, PoApprovalRow,
  PoApprovalInsert,
  PoHeaderValues, PoItemValues, PoReceiptHeaderValues, PoReceiptItemValues, PoHistoryValues,
  PoFull, PoStatusSummaryItem,
} from "../../types/po"

const now = () => sql`(datetime('now'))`

export const poRepository = {

  // ── READ ──────────────────────────────────────────────────────

  async findAll(
    tenantId: number,
    filter: PoFilter = {},
  ): Promise<PoListRow[]> {
    const conditions = [
      eq(purchaseOrders.tenantId, tenantId),
      isNull(purchaseOrders.deletedAt),
    ]
    if (filter.status)     conditions.push(eq(purchaseOrders.status, filter.status))
    if (filter.supplierId) conditions.push(eq(purchaseOrders.supplierId, filter.supplierId))
    if (filter.search)     conditions.push(like(purchaseOrders.poNumber, `%${filter.search}%`))

    const rows = await db
      .select({
        id:           purchaseOrders.id,
        poNumber:     purchaseOrders.poNumber,
        status:       purchaseOrders.status,
        supplierId:   purchaseOrders.supplierId,
        supplierName: suppliers.name,
        currency:     purchaseOrders.currency,
        exchangeRate: purchaseOrders.exchangeRate,
        totalAmount:  purchaseOrders.subtotal,
        expectedDate: purchaseOrders.expectedDate,
        createdAt:    purchaseOrders.createdAt,
        createdBy:    purchaseOrders.createdBy,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(and(...conditions))
      .orderBy(desc(purchaseOrders.updatedAt))

    return rows
  },

  async findOne(tenantId: number, id: number): Promise<PoRow | null> {
    return await db.query.purchaseOrders.findFirst({
      where: and(
        eq(purchaseOrders.tenantId, tenantId),
        eq(purchaseOrders.id, id),
        isNull(purchaseOrders.deletedAt),
      ),
    }) ?? null
  },

  async findItems(
    tenantId: number,
    poId: number,
  ): Promise<PoItemRow[]> {
    return db.query.purchaseOrderItems.findMany({
      where: and(
        eq(purchaseOrderItems.tenantId, tenantId),
        eq(purchaseOrderItems.purchaseOrderId, poId),
      ),
      orderBy: [asc(purchaseOrderItems.sortOrder)],
    })
  },

  async findReceipts(
    tenantId: number,
    poId: number,
  ): Promise<PoReceiptRow[]> {
    return db.query.poReceipts.findMany({
      where: and(
        eq(poReceipts.tenantId, tenantId),
        eq(poReceipts.purchaseOrderId, poId),
      ),
      orderBy: [desc(poReceipts.receivedDate)],
    })
  },

  async findReceiptItems(
    tenantId: number,
    receiptId: number,
  ): Promise<PoReceiptItemRow[]> {
    return db.query.poReceiptItems.findMany({
      where: and(
        eq(poReceiptItems.tenantId, tenantId),
        eq(poReceiptItems.receiptId, receiptId),
      ),
    })
  },

  async findHistory(
    tenantId: number,
    poId: number,
  ): Promise<PoHistoryRow[]> {
    return db.query.poHistory.findMany({
      where: and(
        eq(poHistory.tenantId, tenantId),
        eq(poHistory.purchaseOrderId, poId),
      ),
      orderBy: [desc(poHistory.createdAt)],
    })
  },

  async findFull(
    tenantId: number,
    id: number,
  ): Promise<PoFull | null> {
    const po = await this.findOne(tenantId, id)
    if (!po) return null
    const [items, receipts, history] = await Promise.all([
      this.findItems(tenantId, id),
      this.findReceipts(tenantId, id),
      this.findHistory(tenantId, id),
    ])
    return { ...po, items, receipts, history }
  },

  // ── CREATE ────────────────────────────────────────────────────

  async createWithItems(
    tenantId: number,
    header: PoHeaderValues,
    items: PoItemValues[],
  ): Promise<PoRow> {
    return db.transaction(async (tx) => {
      const [po] = await tx.insert(purchaseOrders)
        .values({ ...header, tenantId })
        .returning()

      if (items.length > 0) {
        await tx.insert(purchaseOrderItems).values(
          items.map((it, i) => ({
            ...it,
            tenantId,
            purchaseOrderId: po.id,
            sortOrder:       it.sortOrder ?? i,
          })),
        )
      }

      await tx.insert(poHistory).values({
        tenantId,
        purchaseOrderId: po.id,
        action:          "created",
        oldStatus:       null,
        newStatus:       po.status,
        changedBy:       header.createdBy ?? null,
      })
      return po
    })
  },

  // ── UPDATE ────────────────────────────────────────────────────

  async updateWithItems(
    tenantId: number,
    id: number,
    header: Partial<PoHeaderValues>,
    items: PoItemValues[],
    changedBy?: string | null,
  ): Promise<void> {
    return db.transaction(async (tx) => {
      await tx.update(purchaseOrders)
        .set({ ...header, updatedAt: now() })
        .where(and(
          eq(purchaseOrders.tenantId, tenantId),
          eq(purchaseOrders.id, id),
        ))

      await tx.delete(purchaseOrderItems).where(and(
        eq(purchaseOrderItems.tenantId, tenantId),
        eq(purchaseOrderItems.purchaseOrderId, id),
      ))
      if (items.length > 0) {
        await tx.insert(purchaseOrderItems).values(
          items.map((it, i) => ({
            ...it,
            tenantId,
            purchaseOrderId: id,
            sortOrder:       it.sortOrder ?? i,
          })),
        )
      }

      await tx.insert(poHistory).values({
        tenantId,
        purchaseOrderId: id,
        action:          "edited",
        oldStatus:       null,
        newStatus:       null,
        changedBy:       changedBy ?? null,
      })
    })
  },

  async updateHeader(
    tenantId: number,
    id: number,
    header: Partial<PoHeaderValues>,
  ): Promise<void> {
    await db.update(purchaseOrders)
      .set({ ...header, updatedAt: now() })
      .where(and(
        eq(purchaseOrders.tenantId, tenantId),
        eq(purchaseOrders.id, id),
      ))
  },

  async updateStatus(
    tenantId: number,
    id: number,
    status: string,
    changedBy?: string | null,
    note?: string | null,
  ): Promise<void> {
    return db.transaction(async (tx) => {
      const current = await tx.query.purchaseOrders.findFirst({
        where: and(
          eq(purchaseOrders.tenantId, tenantId),
          eq(purchaseOrders.id, id),
        ),
        columns: { status: true },
      })
      const oldStatus = current?.status ?? null

      await tx.update(purchaseOrders)
        .set({ status, updatedAt: now() })
        .where(and(
          eq(purchaseOrders.tenantId, tenantId),
          eq(purchaseOrders.id, id),
        ))

      await tx.insert(poHistory).values({
        tenantId,
        purchaseOrderId: id,
        action:          "status_change",
        oldStatus,
        newStatus:       status,
        changedBy:       changedBy ?? null,
        note:            note ?? null,
      })
    })
  },

  async updateItemReceivedQty(
    tenantId: number,
    poItemId: number,
    qty: number,
  ): Promise<void> {
    await db.update(purchaseOrderItems)
      .set({ quantityReceived: qty })
      .where(and(
        eq(purchaseOrderItems.tenantId, tenantId),
        eq(purchaseOrderItems.id, poItemId),
      ))
  },

  // ── DELETE / RESTORE ──────────────────────────────────────────

  async softDelete(tenantId: number, id: number): Promise<void> {
    await db.update(purchaseOrders)
      .set({ deletedAt: now(), updatedAt: now() })
      .where(and(
        eq(purchaseOrders.tenantId, tenantId),
        eq(purchaseOrders.id, id),
      ))
  },

  async restore(tenantId: number, id: number): Promise<void> {
    await db.update(purchaseOrders)
      .set({ deletedAt: null, updatedAt: now() })
      .where(and(
        eq(purchaseOrders.tenantId, tenantId),
        eq(purchaseOrders.id, id),
      ))
  },

  // ── RECEIPTS (GR) ─────────────────────────────────────────────

  async createReceipt(
    tenantId: number,
    header: PoReceiptHeaderValues,
    items: PoReceiptItemValues[],
  ): Promise<PoReceiptRow> {
    return db.transaction(async (tx) => {
      const [receipt] = await tx.insert(poReceipts)
        .values({ ...header, tenantId })
        .returning()

      if (items.length > 0) {
        await tx.insert(poReceiptItems).values(
          items.map(it => ({
            ...it,
            tenantId,
            receiptId: receipt.id,
          })),
        )
      }
      return receipt
    })
  },

  // ── HISTORY ───────────────────────────────────────────────────

  async addHistory(
    tenantId: number,
    entry: PoHistoryValues,
  ): Promise<void> {
    await db.insert(poHistory).values({ ...entry, tenantId })
  },

  // ── APPROVALS ─────────────────────────────────────────────────

  async addApproval(
    tenantId: number,
    approval: Omit<PoApprovalInsert, "id" | "tenantId" | "decidedAt">,
  ): Promise<PoApprovalRow> {
    const [row] = await db.insert(poApprovals)
      .values({ ...approval, tenantId })
      .returning()
    return row
  },

  async findApprovals(
    tenantId: number,
    poId: number,
  ): Promise<PoApprovalRow[]> {
    return db.query.poApprovals.findMany({
      where: and(
        eq(poApprovals.tenantId, tenantId),
        eq(poApprovals.purchaseOrderId, poId),
      ),
      orderBy: [desc(poApprovals.decidedAt)],
    })
  },

  // ── UTIL ──────────────────────────────────────────────────────

  async countByYear(tenantId: number, year: number): Promise<number> {
    const [row] = await db.select({ value: count() })
      .from(purchaseOrders)
      .where(and(
        eq(purchaseOrders.tenantId, tenantId),
        like(purchaseOrders.poNumber, `%${year}%`),
      ))
    return row?.value ?? 0
  },

  async summaryByStatus(tenantId: number): Promise<PoStatusSummaryItem[]> {
    const rows = await db
      .select({
        status:   purchaseOrders.status,
        count:    count(),
        totalThb: sum(purchaseOrders.totalLandedCost),
      })
      .from(purchaseOrders)
      .where(and(
        eq(purchaseOrders.tenantId, tenantId),
        isNull(purchaseOrders.deletedAt),
      ))
      .groupBy(purchaseOrders.status)

    return rows.map(r => ({
      status:   r.status,
      count:    r.count,
      totalThb: Number(r.totalThb ?? 0),
    }))
  },
}

