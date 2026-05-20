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

export * from "./errors"