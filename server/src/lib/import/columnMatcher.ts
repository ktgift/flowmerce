import Fuse from "fuse.js"

export type TargetTable = "trader_products" | "customers" | "suppliers"

const FIELD_SYNONYMS: Record<TargetTable, Record<string, string[]>> = {
  trader_products: {
    code:        ["code", "product_code", "item_code", "รหัสสินค้า", "รหัส"],
    name:        ["name", "product_name", "item_name", "ชื่อสินค้า", "ชื่อ"],
    description: ["description", "desc", "รายละเอียด", "รายการ"],
    unit:        ["unit", "uom", "หน่วย", "หน่วยนับ"],
    category:    ["category", "กลุ่ม", "หมวดหมู่", "type"],
    sell_price:  ["price", "sell_price", "selling_price", "ราคาขาย", "ราคา"],
    cost_price:  ["cost", "cost_price", "ราคาทุน", "ต้นทุน"],
    qty_on_hand: ["qty", "quantity", "stock", "จำนวน", "สต็อก", "คงเหลือ"],
  },
  customers: {
    code:           ["code", "customer_code", "รหัสลูกค้า", "รหัส"],
    name:           ["name", "customer_name", "company_name", "ชื่อลูกค้า", "บริษัท", "ชื่อ"],
    tax_id:         ["tax_id", "tin", "tax", "เลขภาษี", "เลขประจำตัวผู้เสียภาษี"],
    phone:          ["phone", "tel", "telephone", "โทรศัพท์", "เบอร์"],
    email:          ["email", "อีเมล", "e-mail"],
    address:        ["address", "ที่อยู่", "addr"],
    contact_person: ["contact", "contact_person", "ผู้ติดต่อ"],
  },
  suppliers: {
    code:           ["code", "supplier_code", "รหัสซัพพลายเออร์", "รหัส"],
    name:           ["name", "supplier_name", "company_name", "ชื่อซัพพลายเออร์", "บริษัท", "ชื่อ"],
    tax_id:         ["tax_id", "tin", "เลขภาษี"],
    phone:          ["phone", "tel", "โทรศัพท์", "เบอร์"],
    email:          ["email", "อีเมล"],
    address:        ["address", "ที่อยู่"],
    contact_person: ["contact", "contact_person", "ผู้ติดต่อ"],
  },
}

export interface ColumnMatch {
  header:   string
  field:    string | null
  score:    number
  isMapped: boolean
}

export function matchColumns(headers: string[], targetTable: TargetTable): ColumnMatch[] {
  const synonymMap = FIELD_SYNONYMS[targetTable]
  if (!synonymMap) return headers.map(h => ({ header: h, field: null, score: 0, isMapped: false }))

  const candidates: { key: string; field: string }[] = []
  for (const [field, synonyms] of Object.entries(synonymMap)) {
    for (const syn of synonyms) candidates.push({ key: syn.toLowerCase(), field })
  }

  const fuse = new Fuse(candidates, { keys: ["key"], threshold: 0.35, includeScore: true })

  return headers.map(header => {
    const results = fuse.search(header.toLowerCase())
    if (results.length === 0 || (results[0].score ?? 1) > 0.35) {
      return { header, field: null, score: 0, isMapped: false }
    }
    const best = results[0]
    return { header, field: best.item.field, score: 1 - (best.score ?? 0), isMapped: true }
  })
}

export function buildColumnMapping(matches: ColumnMatch[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const m of matches) {
    if (m.isMapped && m.field) mapping[m.header] = m.field
  }
  return mapping
}

export { FIELD_SYNONYMS }
