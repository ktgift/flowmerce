import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { quoteService }       from "./service"
import { quoteDraftService }  from "./draft"
import { quoteExportService } from "./export"
import { parseId }            from "../../lib/utils"
import type { CreateQuoteDto, UpdateQuoteDto, CreateQuoteItemDto, QuoteStatus } from "./model"
import type { Vertical } from "shared"

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

  .get("/", async ({ tenantId }) => {
    const data = await quoteService.findMany(tenantId)
    return { success: true, data }
  })

  .get("/:id", async ({ tenantId, params }) => {
    const data = await quoteService.findOne(tenantId, parseId(params.id))
    return { success: true, data }
  }, { params: t.Object({ id: t.String() }) })

  .post("/", async ({ tenantId, body, set }) => {
    const data = await quoteService.create(tenantId, body as CreateQuoteDto)
    set.status = 201
    return { success: true, data }
  }, {
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

  .patch("/:id", async ({ tenantId, params, body }) => {
    const data = await quoteService.update(tenantId, parseId(params.id), body as UpdateQuoteDto)
    return { success: true, data }
  }, {
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

  .patch("/:id/items", async ({ tenantId, params, body }) => {
    const data = await quoteService.updateItems(
      tenantId, parseId(params.id), body.items as CreateQuoteItemDto[],
    )
    return { success: true, data }
  }, {
    params: t.Object({ id: t.String() }),
    body:   t.Object({ items: t.Array(itemSchema) }),
  })

  .patch("/:id/status", async ({ tenantId, params, body }) => {
    const data = await quoteService.updateStatus(
      tenantId, parseId(params.id), body.status as QuoteStatus,
    )
    return { success: true, data }
  }, {
    params: t.Object({ id: t.String() }),
    body:   t.Object({
      status: t.Union([
        t.Literal("draft"), t.Literal("sent"), t.Literal("accepted"),
        t.Literal("rejected"), t.Literal("cancelled"),
      ]),
    }),
  })

  .delete("/:id", async ({ tenantId, params, set }) => {
    await quoteService.delete(tenantId, parseId(params.id))
    set.status = 204
  }, { params: t.Object({ id: t.String() }) })

  .post("/ai-draft", async ({ body, vertical }) => {
    const data = await quoteDraftService.generateDraft({ ...body, vertical: vertical as Vertical })
    return { success: true, data }
  }, {
    body: t.Object({
      sessionId:       t.String(),
      customerName:    t.String({ minLength: 1 }),
      customerCompany: t.String({ minLength: 1 }),
      freeText:        t.String({ minLength: 1 }),
    }),
  })

  // Binary export — no envelope, return file directly
  .get("/:id/export/pdf", async ({ tenantId, params, set }) => {
    const pdf = await quoteExportService.exportPdf(tenantId, parseId(params.id))
    set.headers["Content-Type"]        = "application/pdf"
    set.headers["Content-Disposition"] = `attachment; filename="quotation-${params.id}.pdf"`
    return pdf
  }, { params: t.Object({ id: t.String() }) })

  .get("/:id/export/excel", async ({ tenantId, params, set }) => {
    const buf = await quoteExportService.exportExcel(tenantId, parseId(params.id))
    set.headers["Content-Type"]        = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    set.headers["Content-Disposition"] = `attachment; filename="quotation-${params.id}.xlsx"`
    return buf
  }, { params: t.Object({ id: t.String() }) })
