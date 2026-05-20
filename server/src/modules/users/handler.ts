import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { authMiddleware }   from "../../middleware/auth"
import { usersService }     from "./service"
import { Errors }           from "../../lib/errors"
import type { UserRole }    from "./model"

const handler = {

  async login(tenantId: number, body: { email: string; password: string }) {
    return usersService.login(tenantId, body)
  },

  async me(tenantId: number, userId: number) {
    return usersService.getById(tenantId, userId)
  },

  async list(tenantId: number, userRole: UserRole) {
    if (userRole !== "admin") throw Errors.FORBIDDEN()
    return usersService.list(tenantId)
  },

  async create(
    tenantId: number,
    userRole: UserRole,
    body: { name: string; email: string; password: string; role: UserRole },
  ) {
    if (userRole !== "admin") throw Errors.FORBIDDEN()
    return usersService.create(tenantId, body)
  },

  async update(
    tenantId: number,
    userRole: UserRole,
    id: number,
    body: { name?: string; role?: UserRole; isActive?: boolean },
  ) {
    if (userRole !== "admin") throw Errors.FORBIDDEN()
    return usersService.update(tenantId, id, body)
  },
}

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

  // POST /users/login
  .post("/login", ({ tenantId, body }) =>
    handler.login(tenantId, body), {
    body: t.Object({
      email:    t.String({ minLength: 1 }),
      password: t.String({ minLength: 1 }),
    }),
  })

  // ── Authenticated ─────────────────────────────────────────────
  .use(authMiddleware)

  // GET /users/me
  .get("/me", ({ tenantId, userId }) =>
    handler.me(tenantId, userId!))

  // GET /users — admin only
  .get("/", ({ tenantId, userRole }) =>
    handler.list(tenantId, userRole!))

  // POST /users — admin only (สร้าง user ใหม่)
  .post("/", ({ tenantId, userRole, body }) =>
    handler.create(tenantId, userRole!, body), {
    body: t.Object({
      name:     t.String({ minLength: 1 }),
      email:    t.String({ minLength: 1 }),
      password: t.String({ minLength: 6 }),
      role:     roleSchema,
    }),
  })

  // PATCH /users/:id — admin only (แก้ role / deactivate)
  .patch("/:id", ({ tenantId, userRole, params, body }) =>
    handler.update(tenantId, userRole!, Number(params.id), body), {
    params: t.Object({ id: t.String() }),
    body: t.Partial(t.Object({
      name:     t.String({ minLength: 1 }),
      role:     roleSchema,
      isActive: t.Boolean(),
    })),
  })
