import { db }                              from "../../db"
import { quotations, quotationItems, quotationHistory } from "../../db/schema"
import { and, eq, desc }                  from "drizzle-orm"
import type {
  QuotationRecord, QuotationItemRecord, QuotationWithItems,
  CreateQuoteDto, CreateQuoteItemDto, QuoteStatus,
} from "./model"

export const quotationRepository = {

  async create(tenantId: number, data: CreateQuoteDto, quoteNumber: string): Promise<QuotationWithItems> {
    const vatRate  = data.vatRate ?? 0.07
    const { subtotal, vatAmount, total } = calcTotals(data.items, vatRate)

    const [qRow] = await db.insert(quotations).values({
      tenantId,
      quoteNumber,
      status:          "draft",
      customerId:      data.customerId  ?? null,
      supplierId:      data.supplierId  ?? null,
      customerName:    data.customerName,
      customerCompany: data.customerCompany,
      projectName:     data.projectName ?? null,
      sessionId:       data.sessionId   ?? null,
      notes:           data.notes       ?? null,
      subtotal,
      vatRate,
      vatAmount,
      total,
      currency:   data.currency   ?? "THB",
      validUntil: data.validUntil ?? null,
    }).returning()

    const items = await insertItems(qRow.id, data.items)
    await db.insert(quotationHistory).values({ quotationId: qRow.id, action: "created" })

    return { ...toRecord(qRow), items }
  },

  async findMany(tenantId: number): Promise<QuotationRecord[]> {
    const rows = await db.query.quotations.findMany({
      where:   eq(quotations.tenantId, tenantId),
      orderBy: [desc(quotations.createdAt)],
    })
    return rows.map(toRecord)
  },

  async findOne(tenantId: number, id: number): Promise<QuotationWithItems | null> {
    const qRow = await db.query.quotations.findFirst({
      where: and(eq(quotations.tenantId, tenantId), eq(quotations.id, id)),
    })
    if (!qRow) return null

    const iRows = await db.query.quotationItems.findMany({
      where:   eq(quotationItems.quotationId, id),
      orderBy: (t, { asc }) => [asc(t.sortOrder)],
    })
    return { ...toRecord(qRow), items: iRows.map(toItemRecord) }
  },

  async update(tenantId: number, id: number, patch: Partial<QuotationRecord>): Promise<void> {
    await db.update(quotations)
      .set({ ...patch, updatedAt: new Date().toISOString() })
      .where(and(eq(quotations.tenantId, tenantId), eq(quotations.id, id)))
  },

  async updateStatus(tenantId: number, id: number, status: QuoteStatus): Promise<void> {
    await db.update(quotations)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(and(eq(quotations.tenantId, tenantId), eq(quotations.id, id)))
    await db.insert(quotationHistory).values({ quotationId: id, action: `status:${status}` })
  },

  async replaceItems(tenantId: number, quotationId: number, items: CreateQuoteItemDto[], vatRate: number): Promise<void> {
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId))
    await insertItems(quotationId, items)

    const { subtotal, vatAmount, total } = calcTotals(items, vatRate)
    await db.update(quotations)
      .set({ subtotal, vatAmount, total, updatedAt: new Date().toISOString() })
      .where(and(eq(quotations.tenantId, tenantId), eq(quotations.id, quotationId)))

    await db.insert(quotationHistory).values({ quotationId, action: "items_updated" })
  },

  async delete(tenantId: number, id: number): Promise<void> {
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id))
    await db.delete(quotationHistory).where(eq(quotationHistory.quotationId, id))
    await db.delete(quotations).where(and(eq(quotations.tenantId, tenantId), eq(quotations.id, id)))
  },

  async nextQuoteNumber(tenantId: number): Promise<string> {
    const year  = new Date().getFullYear()
    const rows  = await db.query.quotations.findMany({
      where:   eq(quotations.tenantId, tenantId),
      columns: { quoteNumber: true },
    })
    const prefix = `QT-${year}-`
    const nums   = rows
      .map(r => r.quoteNumber)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.slice(prefix.length)) || 0)
    const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1
    return `${prefix}${String(next).padStart(4, "0")}`
  },
}

async function insertItems(quotationId: number, items: CreateQuoteItemDto[]) {
  const records = items.map((item, i) => ({
    quotationId,
    productId:   item.productId ?? null,
    productName: item.productName,
    description: item.description ?? null,
    qty:         item.qty,
    unit:        item.unit,
    unitPrice:   item.unitPrice,
    discountPct: item.discountPct ?? 0,
    lineTotal:   calcLineTotal(item),
    sortOrder:   i,
  }))
  if (records.length === 0) return []
  const rows = await db.insert(quotationItems).values(records).returning()
  return rows.map(toItemRecord)
}

function calcLineTotal(item: CreateQuoteItemDto): number {
  const gross    = item.qty * item.unitPrice
  const discount = gross * ((item.discountPct ?? 0) / 100)
  return Math.round((gross - discount) * 100) / 100
}

function calcTotals(items: CreateQuoteItemDto[], vatRate: number) {
  const subtotal  = items.reduce((sum, i) => sum + calcLineTotal(i), 0)
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100
  const total     = Math.round((subtotal + vatAmount) * 100) / 100
  return { subtotal: Math.round(subtotal * 100) / 100, vatAmount, total }
}

function toRecord(row: any): QuotationRecord {
  return {
    id:              row.id,
    tenantId:        row.tenantId,
    quoteNumber:     row.quoteNumber,
    status:          row.status as QuoteStatus,
    customerId:      row.customerId,
    supplierId:      row.supplierId ?? null,
    customerName:    row.customerName,
    customerCompany: row.customerCompany,
    projectName:     row.projectName,
    sessionId:       row.sessionId,
    notes:           row.notes,
    subtotal:        row.subtotal,
    vatRate:         row.vatRate,
    vatAmount:       row.vatAmount,
    total:           row.total,
    currency:        row.currency,
    validUntil:      row.validUntil,
    createdAt:       row.createdAt,
    updatedAt:       row.updatedAt,
  }
}

function toItemRecord(row: any): QuotationItemRecord {
  return {
    id:          row.id,
    quotationId: row.quotationId,
    productId:   row.productId,
    productName: row.productName,
    description: row.description,
    qty:         row.qty,
    unit:        row.unit,
    unitPrice:   row.unitPrice,
    discountPct: row.discountPct,
    lineTotal:   row.lineTotal,
    sortOrder:   row.sortOrder,
  }
}
