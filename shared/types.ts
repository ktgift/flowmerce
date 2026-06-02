export interface FileChunk {
  id:          string
  sessionId:   string
  fileName:    string
  fileType:    string
  sheetName?:  string
  rowStart?:   number
  rowEnd?:     number
  pageNumber?: number
  chunkIndex:  number
  content:     string
  preview:     string
  embedding:   number[]
}

export interface SourceRef {
  fileName:    string
  fileType:    string
  sheetName?:  string
  rowStart?:   number
  rowEnd?:     number
  pageNumber?: number
  preview:     string
  score:       number
}

export interface SessionInfo {
  sessionId: string
  files:     string[]
  createdAt: string
}

// ─── Mail ─────────────────────────────────────────────────────

export interface MailMessage {
  id:         string
  fromEmail:  string
  fromName:   string
  subject:    string
  bodyText:   string
  receivedAt: string
}

export interface Email extends MailMessage {
  sessionId: string
  provider:  string
}

export interface Draft {
  id:        string
  emailId:   string
  sessionId: string
  draftBody: string
  status:    "pending" | "edited" | "sent" | "discarded"
  sentAt?:   string
  createdAt: string
  updatedAt: string
}

export interface EmailWithDraft extends Email {
  draft?: Draft
}

// ─── Auth ─────────────────────────────────────────────────────

export interface MailToken {
  sessionId:    string
  provider:     "gmail" | "outlook"
  accessToken:  string
  refreshToken: string | null
  expiresAt:    number
  email:        string
}

export interface AuthStatus {
  provider: string
  email:    string
}

// ─── API Request / Response ───────────────────────────────────

export interface UploadResponse {
  sessionId:   string
  uploaded:    { fileName: string; chunks: number }[]
  totalChunks: number
  files:       string[]
}

export interface ChatRequest {
  sessionId: string
  question:  string
}

export interface EmailReplyRequest {
  sessionId:    string
  emailContent: string
  tone:         "formal" | "friendly" | "brief"
  language:     "th" | "en"
}

export interface QuoteItem {
  productName: string
  quantity:    number
  unit:        string
}

export interface QuoteRequest {
  sessionId:       string
  customerName:    string
  customerCompany: string
  items:           QuoteItem[]
  notes?:          string
}

// ─── Tenant & Vertical ────────────────────────────────────────

export const DEFAULT_TENANT_ID = 1

export type Vertical = "trader" | "hvac" | "generic"

export interface TenantSettings {
  currency:          string   // "THB"
  vatRate:           number   // 0.07
  quoteNumberFormat: string   // "QT-{YYYY}-{####}"
  poNumberFormat:    string   // "PO-{YYYY}-{####}"
  fiscalYearStart:   string   // "01-01" (MM-DD)
  companyName:       string
  companyAddress:    string
  companyTaxId:      string
  companyPhone:      string
  companyLogclassName: string  // path/URL ของ logo
}

export interface Tenant {
  id:        number
  name:      string
  vertical:  Vertical
  settings:  TenantSettings
  createdAt: string
}

export type UserRole = "admin" | "procurement_manager" | "sales" | "warehouse" | "viewer"

// context ที่ middleware inject เข้าทุก request
export interface TenantContext {
  tenantId:  number
  vertical:  Vertical
  userId?:   number
  userRole?: UserRole
  userName?: string
}

// ─── Purchase Order ───────────────────────────────────────────────

export type PoStatus =
  | "draft"
  | "issued"
  | "acknowledged"
  | "partial_received"
  | "received"
  | "closed"
  | "cancelled"
  // Phase 2 — approval flow (not yet implemented)
  // | "pending_approval"
  // | "approved"
  // | "sent_to_supplier"
  // | "rejected"

export interface CreatePoItemInput {
  itemType?:             string
  refId?:                number | null
  name:                  string
  sku?:                  string | null
  unit?:                 string | null
  quantity:              number
  exWorkPrice:           number
  freightCost?:          number
  cifPrice?:             number
  taxRate?:              number
  clearingCost?:         number
  warehouseCostPercent?: number
  sortOrder?:            number
}

export interface CreatePoInput {
  supplierId?:     number | null
  currency?:       string
  exchangeRate?:   number
  paymentTerm?:    string | null
  deliveryTerm?:   string | null
  shippingMethod?: string | null
  expectedDate?:   string | null
  remark?:         string | null
  createdBy?:      string | null
  items:           CreatePoItemInput[]
}

export interface UpdatePoInput {
  supplierId?:     number | null
  currency?:       string
  exchangeRate?:   number
  paymentTerm?:    string | null
  deliveryTerm?:   string | null
  shippingMethod?: string | null
  expectedDate?:   string | null
  remark?:         string | null
  items?:          CreatePoItemInput[]
}

export interface CreateReceiptItemInput {
  poItemId:           number
  quantityReceived:   number
  lotNumber?:         string | null
  lotExpirationDate?: string | null
  location?:          string | null
  note?:              string | null
}

export interface CreateReceiptInput {
  receiptNumber: string
  receivedDate?: string | null
  receivedBy?:   string | null
  note?:         string | null
  items:         CreateReceiptItemInput[]
}

// ─── Import (Excel import wizard) ─────────────────────────────────

export type ImportTargetTable = "trader_products" | "customers" | "suppliers"

export const IMPORT_TARGET_TABLES: readonly ImportTargetTable[] = [
  "trader_products",
  "customers",
  "suppliers",
] as const

export const IMPORT_SYSTEM_FIELDS: Record<ImportTargetTable, readonly string[]> = {
  trader_products: ["code", "name", "description", "unit", "category", "sell_price", "cost_price", "qty_on_hand"],
  customers:       ["code", "name", "tax_id", "phone", "email", "address", "contact_person"],
  suppliers:       ["code", "name", "tax_id", "phone", "email", "address", "contact_person"],
} as const

export * from "./errors"