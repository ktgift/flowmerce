import { IMPORT_TARGET_TABLES, type ImportTargetTable } from "shared"

import type { ImportMode, ImportModeMeta } from "@/lib/@types/import"

export const IMPORT_MODE_OPTIONS: { value: ImportMode; label: string }[] = [
  { value: "generic",          label: "Generic" },
  { value: "supplier_catalog", label: "Supplier Catalog" },
]

export const IMPORT_SUPPLIER_CATALOG_TARGET: ImportTargetTable = "trader_products"

export const IMPORT_MODES: ImportModeMeta[] = [
  {
    value:    "generic",
    label:    "Generic",
    hint:     "Open table",
    iconName: "bolt",
  },
  {
    value:    "supplier_catalog",
    label:    "Supplier catalog",
    hint:     "1 file = 1 supplier",
    iconName: "tag",
    isNew:    true,
  },
]

export const IMPORT_MODE_HINTS: Record<ImportMode, string> = {
  generic:          "Import to any table — products, customers, or suppliers.",
  supplier_catalog: "One file = one supplier. Every row gets linked automatically.",
}

export const IMPORT_STEPS = [
  "Upload",
  "Match Template",
  "Map & Preview",
  "Summary",
  "Result",
] as const

export const IMPORT_SAMPLE_FILENAME = "Kalsec_price_list_v100.xlsx"
export const IMPORT_MAX_FILE_SIZE_MB = 25

export const IMPORT_TIPS = [
  "The first row of the file must be the header row.",
  "The system will auto-match templates by file name and column headers.",
  "Choose a unique Upsert key such as SKU or Code.",
  "The system will show a preview of 5–10 rows before the real import.",
] as const

const TARGET_LABEL: Record<ImportTargetTable, string> = {
  trader_products: "Products",
  customers:       "Customers",
  suppliers:       "Suppliers",
}

export const IMPORT_TARGET_OPTIONS: { value: ImportTargetTable; label: string }[] =
  IMPORT_TARGET_TABLES.map((t) => ({ value: t, label: TARGET_LABEL[t] }))

export const IMPORT_FILE_ACCEPT = [
  ".xlsx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export const IMPORT_CONFIDENCE_THRESHOLD = 0.7

export const IMPORT_FIELD_LABELS: Record<ImportTargetTable, Record<string, string>> = {
  trader_products: {
    code:        "Product code",
    name:        "Product name",
    description: "Description",
    unit:        "Unit of measure",
    category:    "Category",
    sell_price:  "Sell price",
    cost_price:  "Cost price",
    qty_on_hand: "Quantity on hand",
  },
  customers: {
    code:           "Customer code",
    name:           "Customer name",
    tax_id:         "Tax ID",
    phone:          "Phone",
    email:          "Email",
    address:        "Address",
    contact_person: "Contact person",
  },
  suppliers: {
    code:           "Supplier code",
    name:           "Supplier name",
    tax_id:         "Tax ID",
    phone:          "Phone",
    email:          "Email",
    address:        "Address",
    contact_person: "Contact person",
  },
}

export const IMPORT_IGNORE_VALUE = ""
export const IMPORT_IGNORE_LABEL = "— Ignore —"

// ─── Per-table field rules for preview validation ─────────────────
// Mirrors the DB schema in server/src/db/schema (trader.ts + core.ts):
//
//   trader_products.name   NOT NULL, no default  → required
//   trader_products.unit   NOT NULL, default "pcs"
//   trader_products.code / description / category → nullable text
//
//   product_prices.sell_price / cost_price → money() = real NOT NULL default 0
//     → backend treats empty as "skip", so empty is fine; if a value IS
//       provided it must parse as a number. Negative values would store but
//       are almost always a data error → flag as a UX warning.
//
//   product_inventory.qty_on_hand → real NOT NULL default 0 (same rule)
//
//   customers.name / suppliers.name → NOT NULL → required
//   everything else (code, tax_id, phone, email, address, contact_person) →
//     nullable text, no DB-level format constraint, no preview rule needed.

export interface ImportFieldRule {
  required?: boolean
  numeric?:  boolean
  minValue?: number
}

export const IMPORT_FIELD_RULES: Record<ImportTargetTable, Record<string, ImportFieldRule>> = {
  trader_products: {
    name:        { required: true },
    sell_price:  { numeric:  true, minValue: 0 },
    cost_price:  { numeric:  true, minValue: 0 },
    qty_on_hand: { numeric:  true, minValue: 0 },
  },
  customers: {
    name: { required: true },
  },
  suppliers: {
    name: { required: true },
  },
}
