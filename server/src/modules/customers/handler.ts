import { Elysia, t }          from "elysia"
import { tenantMiddleware }   from "../../middleware/tenant"
import { customerService }    from "./service"

const handler = {

  list:   (tenantId: number, search?: string) => customerService.findMany(tenantId, search),

  get:    (tenantId: number, id: number) => customerService.findOne(tenantId, id),

  create: (tenantId: number, body: {
    name: string; code?: string; taxId?: string; address?: string
    phone?: string; email?: string; contactPerson?: string; notes?: string
  }) => customerService.create(tenantId, {
    code:          body.code          ?? null,
    name:          body.name,
    taxId:         body.taxId         ?? null,
    address:       body.address       ?? null,
    phone:         body.phone         ?? null,
    email:         body.email         ?? null,
    contactPerson: body.contactPerson ?? null,
    notes:         body.notes         ?? null,
    isActive:      true,
  }),

  update: (tenantId: number, id: number, body: {
    name?: string; code?: string; taxId?: string; address?: string
    phone?: string; email?: string; contactPerson?: string; notes?: string; isActive?: boolean
  }) => customerService.update(tenantId, id, body),

  remove: (tenantId: number, id: number) => customerService.delete(tenantId, id),
}

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

  .get("/", ({ tenantId, query }) => handler.list(tenantId, query.search || undefined),
    { query: t.Object({ search: t.Optional(t.String()) }) })

  .get("/:id", ({ tenantId, params }) => handler.get(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })

  .post("/",   ({ tenantId, body }) => handler.create(tenantId, body),
    { body: bodySchema })

  .patch("/:id", ({ tenantId, params, body }) => handler.update(tenantId, Number(params.id), body),
    { params: t.Object({ id: t.String() }), body: patchSchema })

  .delete("/:id", ({ tenantId, params }) => handler.remove(tenantId, Number(params.id)),
    { params: t.Object({ id: t.String() }) })
