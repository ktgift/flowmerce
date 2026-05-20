import { db }        from "../../db"
import { customers } from "../../db/schema"
import { and, eq, isNull, like, or } from "drizzle-orm"
import type { CustomerRecord, NewCustomer, UpdateCustomer } from "./model"

export const customerRepository = {

  async create(data: NewCustomer): Promise<CustomerRecord> {
    const [row] = await db.insert(customers).values(data).returning()
    return toRecord(row)
  },

  async findMany(tenantId: number, search?: string): Promise<CustomerRecord[]> {
    const baseWhere = and(eq(customers.tenantId, tenantId), isNull(customers.deletedAt))
    const where = search
      ? and(baseWhere, or(
          like(customers.name, `%${search}%`),
          like(customers.code, `%${search}%`),
          like(customers.taxId, `%${search}%`),
          like(customers.contactPerson, `%${search}%`),
        ))
      : baseWhere
    const rows = await db.query.customers.findMany({
      where,
      orderBy: (t, { asc }) => [asc(t.name)],
    })
    return rows.map(toRecord)
  },

  async findOne(tenantId: number, id: number): Promise<CustomerRecord | null> {
    const row = await db.query.customers.findFirst({
      where: and(eq(customers.tenantId, tenantId), eq(customers.id, id), isNull(customers.deletedAt)),
    })
    return row ? toRecord(row) : null
  },

  async update(tenantId: number, id: number, patch: UpdateCustomer): Promise<void> {
    await db.update(customers)
      .set({ ...patch, updatedAt: new Date().toISOString() })
      .where(and(eq(customers.tenantId, tenantId), eq(customers.id, id)))
  },

  async softDelete(tenantId: number, id: number): Promise<void> {
    await db.update(customers)
      .set({ deletedAt: new Date().toISOString(), isActive: false })
      .where(and(eq(customers.tenantId, tenantId), eq(customers.id, id)))
  },
}

function toRecord(row: any): CustomerRecord {
  return {
    id:            row.id,
    tenantId:      row.tenantId,
    code:          row.code,
    name:          row.name,
    taxId:         row.taxId,
    address:       row.address,
    phone:         row.phone,
    email:         row.email,
    contactPerson: row.contactPerson,
    notes:         row.notes,
    isActive:      Boolean(row.isActive),
    createdAt:     row.createdAt,
    updatedAt:     row.updatedAt,
    deletedAt:     row.deletedAt,
  }
}
