import { Database } from "bun:sqlite"
import { DEFAULT_TENANT_ID } from "shared"
import type { TenantSettings } from "shared"

const settings: TenantSettings = {
  currency:          "THB",
  vatRate:           0.07,
  quoteNumberFormat: "QT-{YYYY}-{####}",
  poNumberFormat:    "PO-{YYYY}-{####}",
  fiscalYearStart:   "01-01",
  companyName:       "บริษัท ตัวอย่าง จำกัด",
  companyAddress:    "123 ถ.ตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10110",
  companyTaxId:      "0123456789012",
  companyPhone:      "02-123-4567",
  companyLogclassName: "",
}

const DB_PATH = process.env.NODE_ENV === "production" ? "/app/data/rag.db" : "rag.db"
const sqlite = new Database(DB_PATH)

sqlite
  .prepare(`UPDATE tenants SET name = ?, settings = ? WHERE id = ?`)
  .run("Default", JSON.stringify(settings), DEFAULT_TENANT_ID)

console.log(`Tenant ${DEFAULT_TENANT_ID} seeded.`)
