import { Elysia, t }          from "elysia"
import { tenantMiddleware }   from "../../middleware/tenant"
import { customerService }    from "./service"
import { parseId }            from "../../lib/utils"

const bodySchema = t.Object({
  name:          t.String({ minLength: 1 }),
  code:          t.Optional(t.String()),
  taxId:         t.Optional(t.String()),
  address:       t.Optional(t.String()),
  phone:         t.Optional(t.String()),
  email:         t.Optional(t.String()),
  contactPerson: t.Optional(t.String()),
  notes:         t.Optional(t.String()),
})

const patchSchema = t.Partial(t.Object({
  name:          t.String(),
  code:          t.String(),
  taxId:         t.String(),
  address:       t.String(),
  phone:         t.String(),
  email:         t.String(),
  contactPerson: t.String(),
  notes:         t.String(),
  isActive:      t.Boolean(),
}))

export const customerRoute = new Elysia({ prefix: "/customers" })
  .use(tenantMiddleware)

  .get("/", async ({ tenantId, query }) => {
    const data = await customerService.findMany(tenantId, query.search || undefined)
    return { success: true, data }
  }, { query: t.Object({ search: t.Optional(t.String()) }) })

  .get("/:id", async ({ tenantId, params }) => {
    const data = await customerService.findOne(tenantId, parseId(params.id))
    return { success: true, data }
  }, { params: t.Object({ id: t.String() }) })

  .post("/", async ({ tenantId, body, set }) => {
    const data = await customerService.create(tenantId, {
      code:          body.code          ?? null,
      name:          body.name,
      taxId:         body.taxId         ?? null,
      address:       body.address       ?? null,
      phone:         body.phone         ?? null,
      email:         body.email         ?? null,
      contactPerson: body.contactPerson ?? null,
      notes:         body.notes         ?? null,
      isActive:      true,
    })
    set.status = 201
    return { success: true, data }
  }, { body: bodySchema })

  .patch("/:id", async ({ tenantId, params, body }) => {
    const data = await customerService.update(tenantId, parseId(params.id), body)
    return { success: true, data }
  }, { params: t.Object({ id: t.String() }), body: patchSchema })

  .delete("/:id", async ({ tenantId, params, set }) => {
    await customerService.delete(tenantId, parseId(params.id))
    set.status = 204
  }, { params: t.Object({ id: t.String() }) })
