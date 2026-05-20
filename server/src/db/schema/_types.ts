import { integer, real, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
import { DEFAULT_TENANT_ID } from "shared"

export const pk        = ()                          => integer("id").primaryKey({ autoIncrement: true })
export const tenantId  = ()                          => integer("tenant_id").notNull().default(DEFAULT_TENANT_ID)
export const bool      = (name: string, def = false) => integer(name, { mode: "boolean" }).notNull().default(def)
export const money     = (name: string)              => real(name).notNull().default(0)
export const decimal   = (name: string)              => real(name)
export const createdAt = ()                          => text("created_at").default(sql`(datetime('now'))`)
export const updatedAt = ()                          => text("updated_at").default(sql`(datetime('now'))`)
export const deletedAt = ()                          => text("deleted_at")
export const timestamp = (name: string)              => text(name)
