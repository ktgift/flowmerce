import { db }         from "../../db"
import { users }      from "../../db/schema/core"
import { eq, and }    from "drizzle-orm"
import type { UserRole } from "./model"

const safeColumns = {
  id:        users.id,
  tenantId:  users.tenantId,
  name:      users.name,
  email:     users.email,
  role:      users.role,
  isActive:  users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const

export const usersRepository = {

  async findByEmail(tenantId: number, email: string) {
    return db.select().from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.email, email)))
      .get()
  },

  async findById(tenantId: number, id: number) {
    return db.select(safeColumns).from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.id, id)))
      .get()
  },

  async findAll(tenantId: number) {
    return db.select(safeColumns).from(users)
      .where(eq(users.tenantId, tenantId))
      .all()
  },

  async create(tenantId: number, data: {
    name:         string
    email:        string
    passwordHash: string
    role:         UserRole
  }) {
    return db.insert(users).values({ tenantId, ...data }).returning().get()
  },

  async update(tenantId: number, id: number, data: {
    name?:     string
    role?:     UserRole
    isActive?: boolean
  }) {
    return db.update(users)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(and(eq(users.tenantId, tenantId), eq(users.id, id)))
      .returning(safeColumns)
      .get()
  },

  async countByTenant(tenantId: number): Promise<number> {
    const rows = await db.select({ id: users.id }).from(users)
      .where(eq(users.tenantId, tenantId)).all()
    return rows.length
  },
}
