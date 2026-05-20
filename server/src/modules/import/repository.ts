import { db }              from "../../db"
import { importTemplates } from "../../db/schema"
import { and, eq }         from "drizzle-orm"

export interface ImportTemplate {
  id:            number
  tenantId:      number
  name:          string
  targetTable:   string
  columnMapping: Record<string, string>
  createdAt:     string | null
  updatedAt:     string | null
}

export const importTemplateRepository = {

  async create(tenantId: number, name: string, targetTable: string, columnMapping: Record<string, string>): Promise<ImportTemplate> {
    const [row] = await db.insert(importTemplates)
      .values({ tenantId, name, targetTable, columnMapping })
      .returning()
    return toRecord(row)
  },

  async findMany(tenantId: number): Promise<ImportTemplate[]> {
    const rows = await db.query.importTemplates.findMany({
      where: eq(importTemplates.tenantId, tenantId),
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    })
    return rows.map(toRecord)
  },

  async findOne(tenantId: number, id: number): Promise<ImportTemplate | null> {
    const row = await db.query.importTemplates.findFirst({
      where: and(eq(importTemplates.tenantId, tenantId), eq(importTemplates.id, id)),
    })
    return row ? toRecord(row) : null
  },

  async update(tenantId: number, id: number, name: string, columnMapping: Record<string, string>): Promise<void> {
    await db.update(importTemplates)
      .set({ name, columnMapping, updatedAt: new Date().toISOString() })
      .where(and(eq(importTemplates.tenantId, tenantId), eq(importTemplates.id, id)))
  },

  async delete(tenantId: number, id: number): Promise<void> {
    await db.delete(importTemplates)
      .where(and(eq(importTemplates.tenantId, tenantId), eq(importTemplates.id, id)))
  },
}

function toRecord(row: any): ImportTemplate {
  return {
    id:            row.id,
    tenantId:      row.tenantId,
    name:          row.name,
    targetTable:   row.targetTable,
    columnMapping: row.columnMapping as Record<string, string>,
    createdAt:     row.createdAt,
    updatedAt:     row.updatedAt,
  }
}
