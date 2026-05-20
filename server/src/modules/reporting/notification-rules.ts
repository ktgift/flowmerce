import { db }                    from "../../db"
import { quotations, purchaseOrders, productInventory, traderProducts, tenants }
  from "../../db/schema"
import { and, eq, isNull, lt, lte, gt } from "drizzle-orm"
import { notificationService }  from "./notification"

const QUOTE_EXPIRING_DAYS = 7
const STOCK_LOW_THRESHOLD = 10

async function allTenantIds(): Promise<number[]> {
  const rows = await db.query.tenants.findMany()
  return rows.map(t => t.id)
}

export const notificationRulesService = {

  async runForAllTenants(): Promise<void> {
    const ids = await allTenantIds()
    for (const id of ids) {
      await this.runForTenant(id).catch(err => {
        console.error(`[notif] tenant ${id} failed:`, err)
      })
    }
  },

  async runForTenant(tenantId: number): Promise<void> {
    await Promise.all([
      this.checkQuotesExpiring(tenantId),
      this.checkPosOverdue(tenantId),
      this.checkStockLow(tenantId),
    ])
  },

  async checkQuotesExpiring(tenantId: number) {
    const today    = new Date().toISOString().slice(0, 10)
    const deadline = new Date(Date.now() + QUOTE_EXPIRING_DAYS * 86400_000)
                       .toISOString().slice(0, 10)

    const rows = await db.query.quotations.findMany({
      where: and(
        eq(quotations.tenantId, tenantId),
        eq(quotations.status,   "sent"),
        gt(quotations.validUntil,  today),
        lte(quotations.validUntil, deadline),
      ),
    })

    for (const q of rows) {
      await notificationService.create(tenantId, {
        userId:     null,
        type:       "quote_expiring",
        severity:   "warning",
        title:      `ใบเสนอราคา ${q.quoteNumber} ใกล้หมดอายุ`,
        message:    `หมดอายุวันที่ ${q.validUntil} — มูลค่า ${(q.total ?? 0).toLocaleString()} บาท`,
        entityType: "quotation",
        entityId:   q.id,
        link:       `/quotes/${q.id}`,
      })
    }
  },

  async checkPosOverdue(tenantId: number) {
    const today = new Date().toISOString().slice(0, 10)

    const rows = await db.query.purchaseOrders.findMany({
      where: and(
        eq(purchaseOrders.tenantId,   tenantId),
        isNull(purchaseOrders.deletedAt),
        lt(purchaseOrders.expectedDate, today),
      ),
    })

    const active = rows.filter(p =>
      !["received", "closed", "cancelled"].includes(p.status),
    )

    for (const po of active) {
      await notificationService.create(tenantId, {
        userId:     null,
        type:       "po_overdue",
        severity:   "critical",
        title:      `PO ${po.poNumber} เลยกำหนดส่ง`,
        message:    `กำหนดส่ง ${po.expectedDate} — สถานะปัจจุบัน: ${po.status}`,
        entityType: "purchase_order",
        entityId:   po.id,
        link:       `/purchase-orders/${po.id}`,
      })
    }
  },

  async checkStockLow(tenantId: number) {
    const rows = await db
      .select({
        id:   traderProducts.id,
        name: traderProducts.name,
        unit: traderProducts.unit,
        qty:  productInventory.qtyOnHand,
      })
      .from(traderProducts)
      .innerJoin(productInventory, eq(productInventory.productId, traderProducts.id))
      .where(and(
        eq(traderProducts.tenantId, tenantId),
        isNull(traderProducts.deletedAt),
        lte(productInventory.qtyOnHand, STOCK_LOW_THRESHOLD),
      ))

    for (const p of rows) {
      await notificationService.create(tenantId, {
        userId:     null,
        type:       "stock_low",
        severity:   "warning",
        title:      `สต็อก ${p.name} ใกล้หมด`,
        message:    `เหลือ ${p.qty} ${p.unit ?? ""} — ควรสั่งเพิ่ม`,
        entityType: "trader_product",
        entityId:   p.id,
        link:       `/products/${p.id}`,
      })
    }
  },
}
