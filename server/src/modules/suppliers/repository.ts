import { db }        from "../../db"
import { suppliers } from "../../db/schema"
import { and, eq, isNull, like, or } from "drizzle-orm"
import type { SupplierRecord, NewSupplier, UpdateSupplier, SupplierOption } from "./model"

export const supplierRepository = {

  async create(data: NewSupplier): Promise<SupplierRecord> {
    const [row] = await db.insert(suppliers).values(data).returning()
    return toRecord(row)
  },

  async findMany(tenantId: number, search?: string): Promise<SupplierRecord[]> {
    const baseWhere = and(eq(suppliers.tenantId, tenantId), isNull(suppliers.deletedAt))
    const where = search
      ? and(baseWhere, or(
          like(suppliers.name, `%${search}%`),
          like(suppliers.code, `%${search}%`),
          like(suppliers.taxId, `%${search}%`),
          like(suppliers.contactPerson, `%${search}%`),
        ))
      : baseWhere
    const rows = await db.query.suppliers.findMany({
      where,
      orderBy: (t, { asc }) => [asc(t.name)],
    })
    return rows.map(toRecord)
  },

  async findOne(tenantId: number, id: number): Promise<SupplierRecord | null> {
    const row = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, id), isNull(suppliers.deletedAt)),
    })
    return row ? toRecord(row) : null
  },

  async update(tenantId: number, id: number, patch: UpdateSupplier): Promise<void> {
    await db.update(suppliers)
      .set({ ...patch, updatedAt: new Date().toISOString() })
      .where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, id)))
  },

  async softDelete(tenantId: number, id: number): Promise<void> {
    await db.update(suppliers)
      .set({ deletedAt: new Date().toISOString(), isActive: false })
      .where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, id)))
  },

  async findOptions(tenantId: number): Promise<SupplierOption[]> {
    const rows = await db.query.suppliers.findMany({
      where: and(eq(suppliers.tenantId, tenantId), isNull(suppliers.deletedAt)),
      orderBy: (t, { asc }) => [asc(t.name)],
      columns: { id: true, name: true, code: true, contactPerson: true, email: true, taxId: true, phone: true, address: true },
    })
    return rows.map(r => ({
      id:            r.id,
      label:         r.name,
      code:          r.code,
      contactPerson: r.contactPerson,
      email:         r.email,
      taxId:         r.taxId,
      phone:         r.phone,
      address:       r.address,
    }))
  },
}

function toRecord(row: any): SupplierRecord {
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
