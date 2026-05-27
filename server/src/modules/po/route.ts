import { Elysia }            from "elysia"
import { tenantMiddleware }  from "../../middleware/tenant"
import { authMiddleware }    from "../../middleware/auth"
import { poHandler }         from "./handler"
import { parseId }           from "../../lib/utils"
import {
  listQuerySchema,
  createPoBodySchema,
  createFromQuotationBodySchema,
  updatePoBodySchema,
  changeStatusBodySchema,
  createReceiptBodySchema,
  idParamSchema,
  quotationIdParamSchema,
  receiptParamSchema,
} from "../../types/po"
import type { PoFilter } from "../../types/po"

export const poRoute = new Elysia({ prefix: "/purchase-orders" })
  .use(tenantMiddleware)
  .use(authMiddleware)

  .get("/", async ({ tenantId, query }) => {
    const data = await poHandler.list(tenantId, query as PoFilter)
    return { success: true, data }
  }, { query: listQuerySchema })

  .get("/summary", async ({ tenantId }) => {
    const data = await poHandler.summary(tenantId)
    return { success: true, data }
  })

  .get("/:id", async ({ tenantId, params }) => {
    const data = await poHandler.get(tenantId, parseId(params.id))
    return { success: true, data }
  }, { params: idParamSchema })

  .post("/", async ({ tenantId, vertical, body, set }) => {
    const data = await poHandler.create(tenantId, vertical, body)
    set.status = 201
    return { success: true, data }
  }, { body: createPoBodySchema })

  .post("/from-quotation/:quotationId", async ({ tenantId, vertical, params, body, set }) => {
    const data = await poHandler.createFromQuotation(
      tenantId, vertical, parseId(params.quotationId, "quotationId"), body,
    )
    set.status = 201
    return { success: true, data }
  }, { params: quotationIdParamSchema, body: createFromQuotationBodySchema })

  .patch("/:id", async ({ tenantId, params, body, userName }) => {
    const data = await poHandler.update(tenantId, parseId(params.id), body, userName)
    return { success: true, data }
  }, { params: idParamSchema, body: updatePoBodySchema })

  .delete("/:id", async ({ tenantId, params, set }) => {
    await poHandler.softDelete(tenantId, parseId(params.id))
    set.status = 204
  }, { params: idParamSchema })

  .patch("/:id/status", async ({ tenantId, params, body, userRole, userName }) => {
    const data = await poHandler.changeStatus(
      tenantId,
      parseId(params.id),
      body.status,
      body.changedBy ?? userName,
      body.note,
      userRole,
    )
    return { success: true, data }
  }, { params: idParamSchema, body: changeStatusBodySchema })

  .post("/:id/receipts", async ({ tenantId, params, body, set }) => {
    const data = await poHandler.receive(tenantId, parseId(params.id), body)
    set.status = 201
    return { success: true, data }
  }, { params: idParamSchema, body: createReceiptBodySchema })

  .get("/:id/receipts/:receiptId", async ({ tenantId, params }) => {
    const data = await poHandler.getReceipt(tenantId, parseId(params.receiptId, "receiptId"))
    return { success: true, data }
  }, { params: receiptParamSchema })

  .get("/:id/history", async ({ tenantId, params }) => {
    const data = await poHandler.getHistory(tenantId, parseId(params.id))
    return { success: true, data }
  }, { params: idParamSchema })

  // Binary export — no envelope, return file directly
  .get("/:id/export/pdf", async ({ tenantId, params, set, userName }) => {
    const pdf = await poHandler.exportPdf(tenantId, parseId(params.id), userName)
    set.headers["Content-Type"]        = "application/pdf"
    set.headers["Content-Disposition"] = `attachment; filename="PO-${params.id}.pdf"`
    return pdf
  }, { params: idParamSchema })
