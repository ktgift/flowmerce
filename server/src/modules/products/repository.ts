import { db }                                        from "../../db"
import { traderProducts, productPrices, productInventory } from "../../db/schema"
import { and, eq, isNull, like, or }                from "drizzle-orm"
import type { ProductRecord, PriceRecord, InventoryRecord, NewProduct, UpdateProduct } from "./model"

export const productRepository = {

  async create(data: NewProduct): Promise<ProductRecord> {
    const [row] = await db.insert(traderProducts).values(data).returning()
    return toRecord(row)
  },

  async findMany(tenantId: number, search?: string): Promise<ProductRecord[]> {
    const baseWhere = and(eq(traderProducts.tenantId, tenantId), isNull(traderProducts.deletedAt))
    const where = search
      ? and(baseWhere, or(
          like(traderProducts.name, `%${search}%`),
          like(traderProducts.code, `%${search}%`),
          like(traderProducts.category, `%${search}%`),
          like(traderProducts.description, `%${search}%`),
        ))
      : baseWhere
    const rows = await db.query.traderProducts.findMany({
      where,
      orderBy: (t, { asc }) => [asc(t.name)],
    })
    return rows.map(toRecord)
  },

  async findOne(tenantId: number, id: number): Promise<ProductRecord | null> {
    const row = await db.query.traderProducts.findFirst({
      where: and(eq(traderProducts.tenantId, tenantId), eq(traderProducts.id, id), isNull(traderProducts.deletedAt)),
    })
    return row ? toRecord(row) : null
  },

  async update(tenantId: number, id: number, patch: UpdateProduct): Promise<void> {
    await db.update(traderProducts)
      .set({ ...patch, updatedAt: new Date().toISOString() })
      .where(and(eq(traderProducts.tenantId, tenantId), eq(traderProducts.id, id)))
  },

  async softDelete(tenantId: number, id: number): Promise<void> {
    await db.update(traderProducts)
      .set({ deletedAt: new Date().toISOString(), isActive: false })
      .where(and(eq(traderProducts.tenantId, tenantId), eq(traderProducts.id, id)))
  },

  // ── Prices ─────────────────────────────────────────────────

  async upsertPrice(tenantId: number, productId: number, costPrice: number, sellPrice: number, supplierId?: number): Promise<void> {
    await db.update(productPrices)
      .set({ isCurrent: false })
      .where(and(eq(productPrices.tenantId, tenantId), eq(productPrices.productId, productId), eq(productPrices.isCurrent, true)))

    await db.insert(productPrices).values({
      tenantId,
      productId,
      supplierId: supplierId ?? null,
      costPrice,
      sellPrice,
      effectiveDate: new Date().toISOString().slice(0, 10),
      isCurrent: true,
    })
  },

  async getCurrentPrice(tenantId: number, productId: number): Promise<PriceRecord | null> {
    const row = await db.query.productPrices.findFirst({
      where: and(
        eq(productPrices.tenantId, tenantId),
        eq(productPrices.productId, productId),
        eq(productPrices.isCurrent, true),
      ),
    })
    return row ? toPriceRecord(row) : null
  },

  // ── Inventory ──────────────────────────────────────────────

  async getInventory(tenantId: number, productId: number): Promise<InventoryRecord | null> {
    const row = await db.query.productInventory.findFirst({
      where: and(eq(productInventory.tenantId, tenantId), eq(productInventory.productId, productId)),
    })
    return row ? toInventoryRecord(row) : null
  },

  async upsertInventory(tenantId: number, productId: number, qtyOnHand: number, location?: string): Promise<void> {
    const existing = await db.query.productInventory.findFirst({
      where: and(eq(productInventory.tenantId, tenantId), eq(productInventory.productId, productId)),
    })
    if (existing) {
      await db.update(productInventory)
        .set({ qtyOnHand, location: location ?? existing.location, updatedAt: new Date().toISOString() })
        .where(eq(productInventory.id, existing.id))
    } else {
      await db.insert(productInventory).values({ tenantId, productId, qtyOnHand, location: location ?? null })
    }
  },
}

function toRecord(row: any): ProductRecord {
  return {
    id:          row.id,
    tenantId:    row.tenantId,
    code:        row.code,
    name:        row.name,
    description: row.description,
    unit:        row.unit,
    category:    row.category,
    isActive:    Boolean(row.isActive),
    createdAt:   row.createdAt,
    updatedAt:   row.updatedAt,
    deletedAt:   row.deletedAt,
  }
}

function toPriceRecord(row: any): PriceRecord {
  return {
    id:            row.id,
    tenantId:      row.tenantId,
    productId:     row.productId,
    supplierId:    row.supplierId,
    costPrice:     row.costPrice,
    sellPrice:     row.sellPrice,
    effectiveDate: row.effectiveDate,
    isCurrent:     Boolean(row.isCurrent),
    createdAt:     row.createdAt,
  }
}

function toInventoryRecord(row: any): InventoryRecord {
  return {
    id:          row.id,
    tenantId:    row.tenantId,
    productId:   row.productId,
    qtyOnHand:   row.qtyOnHand,
    qtyReserved: row.qtyReserved,
    location:    row.location,
    updatedAt:   row.updatedAt,
  }
}
