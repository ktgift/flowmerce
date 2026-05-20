import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { productService }   from "./service"

const handler = {

  list: (tenantId: number, search?: string) => productService.findMany(tenantId, search),

  get: (tenantId: number, id: number) => productService.findOne(tenantId, id),

  create: (tenantId: number, body: {
    name: string; code?: string; description?: string; unit?: string
    category?: string; sellPrice?: number; costPrice?: number
  }) => productService.create(tenantId, {
    code:        body.code        ?? null,
    name:        body.name,
    description: body.description ?? null,
    unit:        body.unit        ?? "pcs",
    category:    body.category    ?? null,
    isActive:    true,
    sellPrice:   body.sellPrice,
    costPrice:   body.costPrice,
  }),

  update: (tenantId: number, id: number, body: {
    name?: string; code?: string; description?: string; unit?: string
    category?: string; isActive?: boolean; sellPrice?: number; costPrice?: number
  }) => productService.update(tenantId, id, body),

  remove: (tenantId: number, id: number) => productService.delete(tenantId, id),

  updateInventory: (tenantId: number, id: number, qtyOnHand: number, location?: string) =>
    productService.updateInventory(tenantId, id, qtyOnHand, location),
}

export const productRoute = new Elysia({ prefix: "/products" })
  .use(tenantMiddleware)

  .get("/", ({ tenantId, query }) => handler.list(tenantId, query.search || undefined),
    { query: t.Object({ search: t.Optional(t.String()) }) })

  .get("/:id", ({ tenantId, params }) => handler.get(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })

  .post("/", ({ tenantId, body }) => handler.create(tenantId, body), {
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

  .patch("/:id", ({ tenantId, params, body }) => handler.update(tenantId, Number(params.id), body), {
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

  .delete("/:id", ({ tenantId, params }) => handler.remove(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })

  .patch("/:id/inventory", ({ tenantId, params, body }) =>
    handler.updateInventory(tenantId, Number(params.id), body.qtyOnHand, body.location), {
    params: t.Object({ id: t.String() }),
    body:   t.Object({ qtyOnHand: t.Number(), location: t.Optional(t.String()) }),
  })
