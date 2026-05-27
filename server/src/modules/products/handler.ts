import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { productService }   from "./service"
import { parseId }          from "../../lib/utils"

export const productRoute = new Elysia({ prefix: "/products" })
  .use(tenantMiddleware)

  .get("/", async ({ tenantId, query }) => {
    const data = await productService.findMany(tenantId, query.search || undefined)
    return { success: true, data }
  }, { query: t.Object({ search: t.Optional(t.String()) }) })

  .get("/:id", async ({ tenantId, params }) => {
    const data = await productService.findOne(tenantId, parseId(params.id))
    return { success: true, data }
  }, { params: t.Object({ id: t.String() }) })

  .post("/", async ({ tenantId, body, set }) => {
    const data = await productService.create(tenantId, {
      code:        body.code        ?? null,
      name:        body.name,
      description: body.description ?? null,
      unit:        body.unit        ?? "pcs",
      category:    body.category    ?? null,
      isActive:    true,
      sellPrice:   body.sellPrice,
      costPrice:   body.costPrice,
    })
    set.status = 201
    return { success: true, data }
  }, {
    body: t.Object({
      name:        t.String({ minLength: 1 }),
      code:        t.Optional(t.String()),
      description: t.Optional(t.String()),
      unit:        t.Optional(t.String()),
      category:    t.Optional(t.String()),
      sellPrice:   t.Optional(t.Number()),
      costPrice:   t.Optional(t.Number()),
    }),
  })

  .patch("/:id", async ({ tenantId, params, body }) => {
    const data = await productService.update(tenantId, parseId(params.id), body)
    return { success: true, data }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Partial(t.Object({
      name:        t.String(),
      code:        t.String(),
      description: t.String(),
      unit:        t.String(),
      category:    t.String(),
      isActive:    t.Boolean(),
      sellPrice:   t.Number(),
      costPrice:   t.Number(),
    })),
  })

  .delete("/:id", async ({ tenantId, params, set }) => {
    await productService.delete(tenantId, parseId(params.id))
    set.status = 204
  }, { params: t.Object({ id: t.String() }) })

  .patch("/:id/inventory", async ({ tenantId, params, body }) => {
    const data = await productService.updateInventory(
      tenantId, parseId(params.id), body.qtyOnHand, body.location,
    )
    return { success: true, data }
  }, {
    params: t.Object({ id: t.String() }),
    body:   t.Object({ qtyOnHand: t.Number(), location: t.Optional(t.String()) }),
  })
