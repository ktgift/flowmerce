import { t } from "elysia"
import {
  purchaseOrders, purchaseOrderItems, poReceipts, poReceiptItems,
  poHistory, poApprovals,
} from "../db/schema/core"

export type {
  PoStatus,
  CreatePoItemInput,
  CreatePoInput,
  UpdatePoInput,
  CreateReceiptItemInput,
  CreateReceiptInput,
} from "shared"

// ─── DB-inferred types ────────────────────────────────────────

export type PoRow             = typeof purchaseOrders.$inferSelect
export type PoInsert          = typeof purchaseOrders.$inferInsert

export type PoItemRow         = typeof purchaseOrderItems.$inferSelect
export type PoItemInsert      = typeof purchaseOrderItems.$inferInsert

export type PoReceiptRow      = typeof poReceipts.$inferSelect
export type PoReceiptInsert   = typeof poReceipts.$inferInsert

export type PoReceiptItemRow    = typeof poReceiptItems.$inferSelect
export type PoReceiptItemInsert = typeof poReceiptItems.$inferInsert

export type PoHistoryRow      = typeof poHistory.$inferSelect
export type PoHistoryInsert   = typeof poHistory.$inferInsert

export type PoApprovalRow     = typeof poApprovals.$inferSelect
export type PoApprovalInsert  = typeof poApprovals.$inferInsert

export type PoHeaderValues =
  Omit<PoInsert, "id" | "tenantId" | "createdAt" | "updatedAt" | "deletedAt">

export type PoItemValues =
  Omit<PoItemInsert, "id" | "tenantId" | "purchaseOrderId">

export type PoReceiptHeaderValues =
  Omit<PoReceiptInsert, "id" | "tenantId" | "createdAt">

export type PoReceiptItemValues =
  Omit<PoReceiptItemInsert, "id" | "tenantId" | "receiptId">

export type PoHistoryValues =
  Omit<PoHistoryInsert, "id" | "tenantId" | "createdAt">

export interface PoFull extends PoRow {
  items:    PoItemRow[]
  receipts: PoReceiptRow[]
  history:  PoHistoryRow[]
}

// ─── Validation Schemas ───────────────────────────────────────

export const poItemSchema = t.Object({
  itemType:             t.Optional(t.String()),
  refId:                t.Optional(t.Number()),
  name:                 t.String({ minLength: 1 }),
  sku:                  t.Optional(t.String()),
  unit:                 t.Optional(t.String()),
  quantity:             t.Number({ minimum: 0 }),
  exWorkPrice:          t.Number({ minimum: 0 }),
  freightCost:          t.Optional(t.Number({ minimum: 0 })),
  cifPrice:             t.Optional(t.Number({ minimum: 0 })),
  taxRate:              t.Optional(t.Number({ minimum: 0 })),
  clearingCost:         t.Optional(t.Number({ minimum: 0 })),
  warehouseCostPercent: t.Optional(t.Number({ minimum: 0 })),
  sortOrder:            t.Optional(t.Number()),
})

export const receiptItemSchema = t.Object({
  poItemId:          t.Number(),
  quantityReceived:  t.Number({ minimum: 0 }),
  lotNumber:         t.Optional(t.String()),
  lotExpirationDate: t.Optional(t.String()),
  location:          t.Optional(t.String()),
  note:              t.Optional(t.String()),
})

export const poStatusSchema = t.Union([
  t.Literal("draft"),
  t.Literal("issued"),
  t.Literal("acknowledged"),
  t.Literal("partial_received"),
  t.Literal("received"),
  t.Literal("closed"),
  t.Literal("cancelled"),
  // Phase 2 — approval flow (not yet implemented)
  // t.Literal("pending_approval"),
  // t.Literal("approved"),
  // t.Literal("sent_to_supplier"),
  // t.Literal("rejected"),
])

export const listQuerySchema = t.Object({
  status:     t.Optional(t.String()),
  supplierId: t.Optional(t.Numeric()),
  search:     t.Optional(t.String()),
})

export const createPoBodySchema = t.Object({
  supplierId:     t.Optional(t.Number()),
  currency:       t.Optional(t.String()),
  exchangeRate:   t.Optional(t.Number({ minimum: 0 })),
  paymentTerm:    t.Optional(t.String()),
  deliveryTerm:   t.Optional(t.String()),
  shippingMethod: t.Optional(t.String()),
  expectedDate:   t.Optional(t.String()),
  remark:         t.Optional(t.String()),
  createdBy:      t.Optional(t.String()),
  items:          t.Array(poItemSchema),
})

export const createFromQuotationBodySchema = t.Object({
  supplierId:     t.Optional(t.Number()),
  currency:       t.Optional(t.String()),
  exchangeRate:   t.Optional(t.Number({ minimum: 0 })),
  paymentTerm:    t.Optional(t.String()),
  deliveryTerm:   t.Optional(t.String()),
  shippingMethod: t.Optional(t.String()),
  expectedDate:   t.Optional(t.String()),
  remark:         t.Optional(t.String()),
  createdBy:      t.Optional(t.String()),
})

export const updatePoBodySchema = t.Partial(t.Object({
  supplierId:     t.Number(),
  currency:       t.String(),
  exchangeRate:   t.Number({ minimum: 0 }),
  paymentTerm:    t.String(),
  deliveryTerm:   t.String(),
  shippingMethod: t.String(),
  expectedDate:   t.String(),
  remark:         t.String(),
  items:          t.Array(poItemSchema),
}))

export const changeStatusBodySchema = t.Object({
  status:    poStatusSchema,
  changedBy: t.Optional(t.String()),
  note:      t.Optional(t.String()),
})

export const createReceiptBodySchema = t.Object({
  receiptNumber: t.String({ minLength: 1 }),
  receivedDate:  t.Optional(t.String()),
  receivedBy:    t.Optional(t.String()),
  note:          t.Optional(t.String()),
  items:         t.Array(receiptItemSchema),
})

// ─── Param Schemas ────────────────────────────────────────────

export const idParamSchema          = t.Object({ id: t.String() })
export const quotationIdParamSchema = t.Object({ quotationId: t.String() })
export const receiptParamSchema     = t.Object({ id: t.String(), receiptId: t.String() })

// ─── Interfaces ───────────────────────────────────────────────

export interface PoFilter {
  status?:     string
  supplierId?: number
  search?:     string
}

export interface PoListRow {
  id:           number
  poNumber:     string
  status:       string
  supplierId:   number | null
  supplierName: string | null
  currency:     string | null
  exchangeRate: number | null
  totalAmount:  number | null
  expectedDate: string | null
  createdAt:    string | null
  createdBy:    string | null
}

export interface PoStatusSummaryItem {
  status:   string
  count:    number
  totalThb: number
}

export interface PoSummary {
  byStatus:     PoStatusSummaryItem[]
  openCount:    number
  openTotalThb: number
}
