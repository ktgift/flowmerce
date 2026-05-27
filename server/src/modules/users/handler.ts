import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { authMiddleware }   from "../../middleware/auth"
import { usersService }     from "./service"
import { Errors }           from "../../lib/errors"
import { parseId }          from "../../lib/utils"
import type { UserRole }    from "./model"

const roleSchema = t.Union([
  t.Literal("admin"),
  t.Literal("procurement_manager"),
  t.Literal("sales"),
  t.Literal("warehouse"),
  t.Literal("viewer"),
])

export const usersRoute = new Elysia({ prefix: "/users" })
  .use(tenantMiddleware)

  // ── Public ───────────────────────────────────────────────────

  .post("/login", async ({ tenantId, body }) => {
    const data = await usersService.login(tenantId, body)
    return { success: true, data }
  }, {
    body: t.Object({
      email:    t.String({ minLength: 1 }),
      password: t.String({ minLength: 1 }),
    }),
  })

  // ── Authenticated ─────────────────────────────────────────────
  .use(authMiddleware)

  .get("/me", async ({ tenantId, userId }) => {
    if (!userId) throw Errors.AUTH_REQUIRED()
    const data = await usersService.getById(tenantId, userId)
    return { success: true, data }
  })

  .get("/", async ({ tenantId, userRole }) => {
    if (userRole !== "admin") throw Errors.FORBIDDEN()
    const data = await usersService.list(tenantId)
    return { success: true, data }
  })

  .post("/", async ({ tenantId, userRole, body, set }) => {
    if (userRole !== "admin") throw Errors.FORBIDDEN()
    const data = await usersService.create(tenantId, body)
    set.status = 201
    return { success: true, data }
  }, {
    body: t.Object({
      name:     t.String({ minLength: 1 }),
      email:    t.String({ minLength: 1 }),
      password: t.String({ minLength: 6 }),
      role:     roleSchema,
    }),
  })

  .patch("/:id", async ({ tenantId, userRole, params, body }) => {
    if (userRole !== "admin") throw Errors.FORBIDDEN()
    const data = await usersService.update(tenantId, parseId(params.id), body)
    return { success: true, data }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Partial(t.Object({
      name:     t.String({ minLength: 1 }),
      role:     roleSchema,
      isActive: t.Boolean(),
    })),
  })
