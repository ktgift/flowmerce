import { sqliteTable, text, integer, index, real } from "drizzle-orm/sqlite-core"
import { pk, tenantId, bool, money, createdAt, updatedAt, deletedAt } from "./_types"
import { suppliers } from "./core"

// ─── trader_products ──────────────────────────────────────────

export const traderProducts = sqliteTable("trader_products", {
  id:          pk(),
  tenantId:    tenantId(),
  code:        text("code"),
  name:        text("name").notNull(),
  description: text("description"),
  unit:        text("unit").notNull().default("pcs"),
  category:    text("category"),
  isActive:    bool("is_active", true),
  createdAt:   createdAt(),
  updatedAt:   updatedAt(),
  deletedAt:   deletedAt(),
}, (t) => ({
  tenantIdx: index("tp_tenant_idx").on(t.tenantId),
}))

// ─── product_prices ───────────────────────────────────────────

export const productPrices = sqliteTable("product_prices", {
  id:            pk(),
  tenantId:      tenantId(),
  productId:     integer("product_id").notNull().references(() => traderProducts.id),
  supplierId:    integer("supplier_id").references(() => suppliers.id),
  costPrice:     money("cost_price"),
  sellPrice:     money("sell_price"),
  effectiveDate: text("effective_date"),
  isCurrent:     bool("is_current", true),
  createdAt:     createdAt(),
}, (t) => ({
  tenantProductIdx: index("pp_tenant_product_idx").on(t.tenantId, t.productId),
}))

// ─── product_inventory ────────────────────────────────────────

export const productInventory = sqliteTable("product_inventory", {
  id:          pk(),
  tenantId:    tenantId(),
  productId:   integer("product_id").notNull().references(() => traderProducts.id),
  qtyOnHand:   real("qty_on_hand").notNull().default(0),
  qtyReserved: real("qty_reserved").notNull().default(0),
  location:    text("location"),
  updatedAt:   updatedAt(),
}, (t) => ({
  tenantProductIdx: index("inv_tenant_product_idx").on(t.tenantId, t.productId),
}))

// ─── import_templates ─────────────────────────────────────────

export const importTemplates = sqliteTable("import_templates", {
  id:            pk(),
  tenantId:      tenantId(),
  name:          text("name").notNull(),
  targetTable:   text("target_table").notNull(),
  columnMapping: text("column_mapping", { mode: "json" }).notNull(),
  createdAt:     createdAt(),
  updatedAt:     updatedAt(),
}, (t) => ({
  tenantIdx: index("it_tenant_idx").on(t.tenantId),
}))

// ─── import_logs ──────────────────────────────────────────────

export const importLogs = sqliteTable("import_logs", {
  id:          text("id").primaryKey(),
  tenantId:    tenantId(),
  templateId:  integer("template_id"),
  fileName:    text("file_name").notNull(),
  totalRows:   integer("total_rows").notNull().default(0),
  successRows: integer("success_rows").notNull().default(0),
  failedRows:  integer("failed_rows").notNull().default(0),
  errors:      text("errors", { mode: "json" }),
  createdAt:   createdAt(),
}, (t) => ({
  tenantIdx: index("il_tenant_idx").on(t.tenantId),
}))
