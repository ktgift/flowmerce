import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { quoteService }       from "./service"
import { quoteDraftService }  from "./draft"
import { quoteExportService } from "./export"
import type { CreateQuoteDto, UpdateQuoteDto, CreateQuoteItemDto, QuoteStatus } from "./model"
import type { Vertical } from "shared"

const handler = {

  list:   (tenantId: number) => quoteService.findMany(tenantId),

  get:    (tenantId: number, id: number) => quoteService.findOne(tenantId, id),

  create: (tenantId: number, data: CreateQuoteDto) => quoteService.create(tenantId, data),

  update: (tenantId: number, id: number, patch: UpdateQuoteDto) => quoteService.update(tenantId, id, patch),

  updateItems: (tenantId: number, id: number, items: CreateQuoteItemDto[]) =>
    quoteService.updateItems(tenantId, id, items),

  updateStatus: (tenantId: number, id: number, status: QuoteStatus) =>
    quoteService.updateStatus(tenantId, id, status),

  remove: (tenantId: number, id: number) => quoteService.delete(tenantId, id),

  aiDraft: (tenantId: number, params: {
    sessionId:       string
    vertical:        Vertical
    customerName:    string
    customerCompany: string
    freeText:        string
  }) => quoteDraftService.generateDraft(params),

  exportPdf:   (tenantId: number, id: number) => quoteExportService.exportPdf(tenantId, id),
  exportExcel: (tenantId: number, id: number) => quoteExportService.exportExcel(tenantId, id),
}

const itemSchema = t.Object({
  productId:   t.Optional(t.Number()),
  productName: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
  qty:         t.Number({ minimum: 0 }),
  unit:        t.String({ minLength: 1 }),
  unitPrice:   t.Number({ minimum: 0 }),
  discountPct: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
})

export const quoteRoute = new Elysia({ prefix: "/quotes" })
  .use(tenantMiddleware)

  // List all quotations
  .get("/", ({ tenantId }) => handler.list(tenantId))

  // Get single quotation with items
  .get("/:id", ({ tenantId, params }) => handler.get(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })

  // Create quotation
  .post("/", ({ tenantId, body }) => handler.create(tenantId, body), {
    body: t.Object({
      customerName:    t.String({ minLength: 1 }),
      customerCompany: t.String({ minLength: 1 }),
      sessionId:       t.Optional(t.String()),
      customerId:      t.Optional(t.Number()),
      supplierId:      t.Optional(t.Number()),
      projectName:     t.Optional(t.String()),
      notes:           t.Optional(t.String()),
      vatRate:         t.Optional(t.Number()),
      currency:        t.Optional(t.String()),
      validUntil:      t.Optional(t.String()),
      items:           t.Array(itemSchema),
    }),
  })

  // Update quotation header
  .patch("/:id", ({ tenantId, params, body }) => handler.update(tenantId, Number(params.id), body), {
    params: t.Object({ id: t.String() }),
    body: t.Partial(t.Object({
      customerName:    t.String(),
      customerCompany: t.String(),
      supplierId:      t.Number(),
      projectName:     t.String(),
      notes:           t.String(),
      vatRate:         t.Number(),
      currency:        t.String(),
      validUntil:      t.String(),
    })),
  })

  // Replace all items
  .patch("/:id/items", ({ tenantId, params, body }) =>
    handler.updateItems(tenantId, Number(params.id), body.items), {
    params: t.Object({ id: t.String() }),
    body:   t.Object({ items: t.Array(itemSchema) }),
  })

  // Update status
  .patch("/:id/status", ({ tenantId, params, body }) =>
    handler.updateStatus(tenantId, Number(params.id), body.status as any), {
    params: t.Object({ id: t.String() }),
    body:   t.Object({
      status: t.Union([
        t.Literal("draft"), t.Literal("sent"), t.Literal("accepted"),
        t.Literal("rejected"), t.Literal("cancelled"),
      ]),
    }),
  })

  // Delete quotation
  .delete("/:id", ({ tenantId, params }) => handler.remove(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })

  // AI draft (free-text → structured items, no save)
  .post("/ai-draft", ({ tenantId, body, vertical }) =>
    handler.aiDraft(tenantId, { ...body, vertical }), {
    body: t.Object({
      sessionId:       t.String(),
      customerName:    t.String({ minLength: 1 }),
      customerCompany: t.String({ minLength: 1 }),
      freeText:        t.String({ minLength: 1 }),
    }),
  })

  // Export as PDF
  .get("/:id/export/pdf", async ({ tenantId, params, set }) => {
    const pdf = await handler.exportPdf(tenantId, Number(params.id))
    set.headers["Content-Type"]        = "application/pdf"
    set.headers["Content-Disposition"] = `attachment; filename="quotation-${params.id}.pdf"`
    return pdf
  }, { params: t.Object({ id: t.String() }) })

  // Export as Excel
  .get("/:id/export/excel", async ({ tenantId, params, set }) => {
    const buf = await handler.exportExcel(tenantId, Number(params.id))
    set.headers["Content-Type"]        = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    set.headers["Content-Disposition"] = `attachment; filename="quotation-${params.id}.xlsx"`
    return buf
  }, { params: t.Object({ id: t.String() }) })
