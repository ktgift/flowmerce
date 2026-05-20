export const ErrorCodes = {
  // Upload
  NO_FILE:             "NO_FILE",
  UNSUPPORTED_FORMAT:  "UNSUPPORTED_FORMAT",
  PARSE_FAILED:        "PARSE_FAILED",

  // Session / RAG
  SESSION_EMPTY:       "SESSION_EMPTY",
  NO_RELEVANT_CHUNKS:  "NO_RELEVANT_CHUNKS",

  // Auth / Mail
  NOT_LOGGED_IN:       "NOT_LOGGED_IN",
  TOKEN_EXPIRED:       "TOKEN_EXPIRED",
  MAIL_FETCH_FAILED:   "MAIL_FETCH_FAILED",
  DRAFT_NOT_FOUND:     "DRAFT_NOT_FOUND",
  EMAIL_NOT_FOUND:     "EMAIL_NOT_FOUND",
  SEND_FAILED:         "SEND_FAILED",

  // AI
  AI_FAILED:           "AI_FAILED",

  // Phase 1 – Master Data
  CUSTOMER_NOT_FOUND:        "CUSTOMER_NOT_FOUND",
  SUPPLIER_NOT_FOUND:        "SUPPLIER_NOT_FOUND",
  PRODUCT_NOT_FOUND:         "PRODUCT_NOT_FOUND",

  // Phase 2 – Import
  IMPORT_PARSE_FAILED:       "IMPORT_PARSE_FAILED",
  IMPORT_NO_MAPPING:         "IMPORT_NO_MAPPING",
  IMPORT_TEMPLATE_NOT_FOUND: "IMPORT_TEMPLATE_NOT_FOUND",

  // Phase 3 – Quotation
  QUOTE_NOT_FOUND:           "QUOTE_NOT_FOUND",
  QUOTE_INVALID_ITEM:        "QUOTE_INVALID_ITEM",
  MISSING_PROJECT_NAME:      "MISSING_PROJECT_NAME",

  // Phase 5 – Purchase Orders
  PO_NOT_FOUND:              "PO_NOT_FOUND",
  PO_INVALID_STATUS:         "PO_INVALID_STATUS",
  RECEIPT_NOT_FOUND:         "RECEIPT_NOT_FOUND",

  // Users & Auth
  USER_NOT_FOUND:        "USER_NOT_FOUND",
  USER_ALREADY_EXISTS:   "USER_ALREADY_EXISTS",
  INVALID_CREDENTIALS:   "INVALID_CREDENTIALS",
  INVALID_TOKEN:         "INVALID_TOKEN",
  AUTH_REQUIRED:         "AUTH_REQUIRED",
  FORBIDDEN:             "FORBIDDEN",

  // System
  VALIDATION_ERROR:    "VALIDATION_ERROR",
  INTERNAL_ERROR:      "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export interface ErrorResponse {
  ok:       false
  code:     ErrorCode
  message:  string
  details?: Record<string, unknown>
}
