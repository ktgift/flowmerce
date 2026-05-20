import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { authMiddleware }   from "../../middleware/auth"
import { poService }        from "./service"
import { receivingService } from "./receiving"
import { poRepository }     from "./repository"
import type { PoFilter }    from "./repository"
import type {
  CreatePoInput,
  UpdatePoInput,
  PoStatus,
  CreateReceiptInput,
} from "./model"

const handler = {

  list: (tenantId: number, filter: PoFilter = {}) =>
    poService.list(tenantId, filter),

  get: (tenantId: number, id: number) =>
    poService.get(tenantId, id),

  create: (tenantId: number, vertical: string, body: CreatePoInput) =>
    poService.create(tenantId, vertical, body),

  createFromQuotation: (
    tenantId:    number,
    vertical:    string,
    quotationId: number,
    body:        Omit<CreatePoInput, "items">,
  ) => poService.createFromQuotation(tenantId, vertical, quotationId, body),

  update: (tenantId: number, id: number, body: UpdatePoInput) =>
    poService.update(tenantId, id, body),

  changeStatus: (
    tenantId:  number,
    id:        number,
    status:    PoStatus,
    changedBy?: string,
    note?:      string,
    userRole?:  string,
  ) => poService.changeStatus(tenantId, id, status, changedBy, note, userRole),

  receive: (tenantId: number, poId: number, body: CreateReceiptInput) =>
    receivingService.receive(tenantId, poId, body),

  getReceipt: (tenantId: number, receiptId: number) =>
    receivingService.getReceipt(tenantId, receiptId),

  getHistory: (tenantId: number, id: number) =>
    poRepository.findHistory(tenantId, id),

  remove: (tenantId: number, id: number) =>
    poService.softDelete(tenantId, id),
}

const poItemSchema = t.Object({
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

const receiptItemSchema = t.Object({
  poItemId:          t.Number(),
  quantityReceived:  t.Number({ minimum: 0 }),
  lotNumber:         t.Optional(t.String()),
  lotExpirationDate: t.Optional(t.String()),
  location:          t.Optional(t.String()),
  note:              t.Optional(t.String()),
})

const poStatusSchema = t.Union([
  t.Literal("draft"),
  t.Literal("pending_approval"),
  t.Literal("approved"),
  t.Literal("sent_to_supplier"),
  t.Literal("partial_received"),
  t.Literal("received"),
  t.Literal("closed"),
  t.Literal("cancelled"),
  t.Literal("rejected"),
])

export const poRoute = new Elysia({ prefix: "/pos" })
  .use(tenantMiddleware)

  // List POs (filter by status / supplierId / search)
  .get("/", ({ tenantId, query }) =>
    handler.list(tenantId, {
      status:     query.status     || undefined,
      supplierId: query.supplierId ? Number(query.supplierId) : undefined,
      search:     query.search     || undefined,
    }), {
    query: t.Object({
      status:     t.Optional(t.String()),
      supplierId: t.Optional(t.String()),
      search:     t.Optional(t.String()),
    }),
  })

  // Get single PO with items / receipts / history
  .get("/:id", ({ tenantId, params }) =>
    handler.get(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })

  // Create PO
  .post("/", ({ tenantId, vertical, body }) =>
    handler.create(tenantId, vertical, body), {
    body: t.Object({
      supplierId:   t.Optional(t.Number()),
      currency:     t.Optional(t.String()),
      exchangeRate: t.Optional(t.Number({ minimum: 0 })),
      paymentTerm:  t.Optional(t.String()),
      deliveryTerm: t.Optional(t.String()),
      expectedDate: t.Optional(t.String()),
      remark:       t.Optional(t.String()),
      createdBy:    t.Optional(t.String()),
      items:        t.Array(poItemSchema),
    }),
  })

  // Create PO linked to a quotation (no items — header only)
  .post("/from-quotation/:quotationId", ({ tenantId, vertical, params, body }) =>
    handler.createFromQuotation(tenantId, vertical, Number(params.quotationId), body), {
    params: t.Object({ quotationId: t.String() }),
    body: t.Object({
      supplierId:   t.Optional(t.Number()),
      currency:     t.Optional(t.String()),
      exchangeRate: t.Optional(t.Number({ minimum: 0 })),
      paymentTerm:  t.Optional(t.String()),
      deliveryTerm: t.Optional(t.String()),
      expectedDate: t.Optional(t.String()),
      remark:       t.Optional(t.String()),
      createdBy:    t.Optional(t.String()),
    }),
  })

  // Update PO header (omit items) or header + items
  .patch("/:id", ({ tenantId, params, body }) =>
    handler.update(tenantId, Number(params.id), body), {
    params: t.Object({ id: t.String() }),
    body: t.Partial(t.Object({
      supplierId:   t.Number(),
      currency:     t.String(),
      exchangeRate: t.Number({ minimum: 0 }),
      paymentTerm:  t.String(),
      deliveryTerm: t.String(),
      expectedDate: t.String(),
      remark:       t.String(),
      items:        t.Array(poItemSchema),
    })),
  })

  // Change PO status — requires JWT auth; approval/rejection gated to procurement_manager/admin
  .use(authMiddleware)
  .patch("/:id/status", ({ tenantId, params, body, userRole, userName }) =>
    handler.changeStatus(
      tenantId,
      Number(params.id),
      body.status,
      body.changedBy ?? userName,
      body.note,
      userRole,
    ), {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      status:    poStatusSchema,
      changedBy: t.Optional(t.String()),
      note:      t.Optional(t.String()),
    }),
  })

  // Record goods receipt (GRN)
  .post("/:id/receipts", ({ tenantId, params, body }) =>
    handler.receive(tenantId, Number(params.id), body), {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      receiptNumber: t.String({ minLength: 1 }),
      receivedDate:  t.Optional(t.String()),
      receivedBy:    t.Optional(t.String()),
      note:          t.Optional(t.String()),
      items:         t.Array(receiptItemSchema),
    }),
  })

  // Get receipt detail
  .get("/:id/receipts/:receiptId", ({ tenantId, params }) =>
    handler.getReceipt(tenantId, Number(params.receiptId)), {
    params: t.Object({ id: t.String(), receiptId: t.String() }),
  })

  // Get PO change history
  .get("/:id/history", ({ tenantId, params }) =>
    handler.getHistory(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })

  // Soft-delete PO
  .delete("/:id", ({ tenantId, params }) =>
    handler.remove(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })
