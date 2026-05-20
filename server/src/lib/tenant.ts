import { db }      from "../db"
import { tenants } from "../db/schema"
import { eq }      from "drizzle-orm"
import type { Tenant, TenantSettings } from "shared"

export const tenantRepository = {

  async findOne(id: number): Promise<Tenant | null> {
    const row = await db.query.tenants.findFirst({ where: eq(tenants.id, id) })
    if (!row) return null
    return {
      id:        row.id,
      name:      row.name,
      vertical:  row.vertical as Tenant["vertical"],
      settings:  (row.settings as TenantSettings) ?? ({} as TenantSettings),
      createdAt: row.createdAt ?? "",
    }
  },

  async updateSettings(id: number, settings: Partial<TenantSettings>): Promise<void> {
    const existing = await db.query.tenants.findFirst({ where: eq(tenants.id, id) })
    const merged   = { ...(existing?.settings as object ?? {}), ...settings }
    await db.update(tenants).set({ settings: merged }).where(eq(tenants.id, id))
  },

  async updateVertical(id: number, vertical: string): Promise<void> {
    await db.update(tenants).set({ vertical }).where(eq(tenants.id, id))
  },
}
