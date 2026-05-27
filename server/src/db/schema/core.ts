import { sqliteTable, text, integer, index, uniqueIndex, real } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
import { DEFAULT_TENANT_ID } from "shared"
import { pk, tenantId, bool, money, decimal, createdAt, updatedAt, deletedAt } from "./_types"

// ─── Users ────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id:           pk(),
  tenantId:     tenantId(),
  name:         text("name").notNull(),
  email:        text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role:         text("role").notNull().default("sales"),
  isActive:     bool("is_active", true),
  createdAt:    createdAt(),
  updatedAt:    updatedAt(),
}, (t) => ({
  tenantEmailIdx: uniqueIndex("users_tenant_email_idx").on(t.tenantId, t.email),
  tenantIdx:      index("users_tenant_idx").on(t.tenantId),
}))

// ─── Tenants ──────────────────────────────────────────────────

export const tenants = sqliteTable("tenants", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  name:      text("name").notNull(),
  vertical:  text("vertical").notNull().default("trader"),
  settings:  text("settings", { mode: "json" }),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
})

// ─── file_chunks ──────────────────────────────────────────────

export const fileChunks = sqliteTable("file_chunks", {
  id:         text("id").primaryKey(),
  tenantId:   integer("tenant_id").notNull().default(DEFAULT_TENANT_ID),
  sessionId:  text("session_id").notNull(),
  fileName:   text("file_name").notNull(),
  fileType:   text("file_type").notNull(),
  sheetName:  text("sheet_name"),
  rowStart:   integer("row_start"),
  rowEnd:     integer("row_end"),
  pageNumber: integer("page_number"),
  chunkIndex: integer("chunk_index"),
  content:    text("content").notNull(),
  preview:    text("preview").notNull(),
  embedding:  text("embedding").notNull(),
  createdAt:  text("created_at").default(sql`(datetime('now'))`),
}, (t) => ({
  tenantSessionIdx: index("chunks_tenant_session_idx").on(t.tenantId, t.sessionId),
}))

// ─── mail_tokens ──────────────────────────────────────────────

export const mailTokens = sqliteTable("mail_tokens", {
  id:           text("id").primaryKey(),
  tenantId:     integer("tenant_id").notNull().default(DEFAULT_TENANT_ID),
  sessionId:    text("session_id").notNull(),
  provider:     text("provider").notNull(),
  accessToken:  text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt:    integer("expires_at").notNull(),
  email:        text("email").notNull(),
  createdAt:    text("created_at").default(sql`(datetime('now'))`),
}, (t) => ({
  tenantSessionIdx: index("tokens_tenant_session_idx").on(t.tenantId, t.sessionId),
}))

// ─── emails ───────────────────────────────────────────────────

export const emails = sqliteTable("emails", {
  id:         text("id").primaryKey(),
  tenantId:   integer("tenant_id").notNull().default(DEFAULT_TENANT_ID),
  sessionId:  text("session_id").notNull(),
  provider:   text("provider").notNull(),
  fromEmail:  text("from_email").notNull(),
  fromName:   text("from_name").notNull().default(""),
  subject:    text("subject").notNull(),
  bodyText:   text("body_text").notNull(),
  receivedAt: text("received_at").notNull(),
  fetchedAt:  text("fetched_at").default(sql`(datetime('now'))`),
}, (t) => ({
  tenantSessionIdx: index("emails_tenant_session_idx").on(t.tenantId, t.sessionId),
}))

// ─── drafts ───────────────────────────────────────────────────

export const drafts = sqliteTable("drafts", {
  id:        text("id").primaryKey(),
  tenantId:  integer("tenant_id").notNull().default(DEFAULT_TENANT_ID),
  emailId:   text("email_id").notNull().references(() => emails.id),
  sessionId: text("session_id").notNull(),
  draftBody: text("draft_body").notNull(),
  status:    text("status").notNull().default("pending"),
  sentAt:    text("sent_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (t) => ({
  tenantIdx: index("drafts_tenant_idx").on(t.tenantId),
}))

// ─── suppliers ────────────────────────────────────────────────

export const suppliers = sqliteTable("suppliers", {
  id:            pk(),
  tenantId:      tenantId(),
  code:          text("code"),
  name:          text("name").notNull(),
  taxId:         text("tax_id"),
  address:       text("address"),
  phone:         text("phone"),
  email:         text("email"),
  contactPerson: text("contact_person"),
  notes:         text("notes"),
  isActive:      bool("is_active", true),
  createdAt:     createdAt(),
  updatedAt:     updatedAt(),
  deletedAt:     deletedAt(),
}, (t) => ({
  tenantIdx: index("suppliers_tenant_idx").on(t.tenantId),
}))

// ─── customers ────────────────────────────────────────────────

export const customers = sqliteTable("customers", {
  id:            pk(),
  tenantId:      tenantId(),
  code:          text("code"),
  name:          text("name").notNull(),
  taxId:         text("tax_id"),
  address:       text("address"),
  phone:         text("phone"),
  email:         text("email"),
  contactPerson: text("contact_person"),
  notes:         text("notes"),
  isActive:      bool("is_active", true),
  createdAt:     createdAt(),
  updatedAt:     updatedAt(),
  deletedAt:     deletedAt(),
}, (t) => ({
  tenantIdx: index("customers_tenant_idx").on(t.tenantId),
}))

// ─── quotations ───────────────────────────────────────────────

export const quotations = sqliteTable("quotations", {
  id:              pk(),
  tenantId:        tenantId(),
  quoteNumber:     text("quote_number").notNull(),
  status:          text("status").notNull().default("draft"),
  customerId:      integer("customer_id"),
  supplierId:      integer("supplier_id").references(() => suppliers.id),
  customerName:    text("customer_name").notNull(),
  customerCompany: text("customer_company").notNull(),
  projectName:     text("project_name"),
  sessionId:       text("session_id"),
  notes:           text("notes"),
  subtotal:        money("subtotal"),
  vatRate:         real("vat_rate").notNull().default(0.07),
  vatAmount:       money("vat_amount"),
  total:           money("total"),
  currency:        text("currency").notNull().default("THB"),
  validUntil:      text("valid_until"),
  createdAt:       createdAt(),
  updatedAt:       updatedAt(),
}, (t) => ({
  tenantIdx:    index("quotations_tenant_idx").on(t.tenantId),
  tenantNumIdx: index("quotations_tenant_num_idx").on(t.tenantId, t.quoteNumber),
}))

// ─── quotation_items ──────────────────────────────────────────

export const quotationItems = sqliteTable("quotation_items", {
  id:          pk(),
  quotationId: integer("quotation_id").notNull().references(() => quotations.id),
  productId:   integer("product_id"),
  productName: text("product_name").notNull(),
  description: text("description"),
  qty:         real("qty").notNull().default(1),
  unit:        text("unit").notNull().default("pcs"),
  unitPrice:   money("unit_price"),
  discountPct: real("discount_pct").notNull().default(0),
  lineTotal:   money("line_total"),
  sortOrder:   integer("sort_order").notNull().default(0),
}, (t) => ({
  quotationIdx: index("qi_quotation_idx").on(t.quotationId),
}))

// ─── quotation_history ────────────────────────────────────────

export const quotationHistory = sqliteTable("quotation_history", {
  id:          pk(),
  quotationId: integer("quotation_id").notNull().references(() => quotations.id),
  action:      text("action").notNull(),
  changedBy:   text("changed_by"),
  snapshot:    text("snapshot", { mode: "json" }),
  createdAt:   createdAt(),
}, (t) => ({
  quotationIdx: index("qh_quotation_idx").on(t.quotationId),
}))

// ─── Purchase Orders ─────────────────────────────────────────
// SOFT DELETE — มี receipts, history อ้างอิง

export const purchaseOrders = sqliteTable("purchase_orders", {
  id:               pk(),
  tenantId:         tenantId(),
  vertical:         text("vertical").notNull().default("trader"),
  poNumber:         text("po_number").notNull(),
  supplierId:       integer("supplier_id").references(() => suppliers.id),
  sourceQuotationId: integer("source_quotation_id").references(() => quotations.id),
  status:           text("status").notNull().default("draft"),
  currency:         text("currency").default("USD"),
  exchangeRate:     money("exchange_rate"),
  paymentTerm:      text("payment_term"),
  deliveryTerm:     text("delivery_term"),
  shippingMethod:   text("shipping_method"),
  expectedDate:     text("expected_date"),
  remark:           text("remark"),
  createdBy:        text("created_by"),
  approvedBy:       text("approved_by"),
  subtotal:         money("subtotal"),
  subtotalThb:      money("subtotal_thb"),
  totalLandedCost:  money("total_landed_cost"),
  issuedDate:       text("issued_date").default(sql`(date('now'))`),
  createdAt:        createdAt(),
  updatedAt:        updatedAt(),
  deletedAt:        deletedAt(),
}, (t) => ({
  tenantPoUnique: uniqueIndex("po_tenant_number").on(t.tenantId, t.poNumber),
  tenantIdx:      index("po_tenant_idx").on(t.tenantId),
  supplierIdx:    index("po_supplier_idx").on(t.supplierId),
  statusIdx:      index("po_status_idx").on(t.tenantId, t.status),
}))

// ─── Purchase Order Items ─────────────────────────────────────
// HARD DELETE — CASCADE จาก purchase_orders

export const purchaseOrderItems = sqliteTable("purchase_order_items", {
  id:                   pk(),
  tenantId:             tenantId(),
  purchaseOrderId:      integer("purchase_order_id").notNull()
                          .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  itemType:             text("item_type").notNull().default("trader_product"),
  refId:                integer("ref_id"),
  name:                 text("name").notNull(),
  sku:                  text("sku"),
  unit:                 text("unit"),
  quantity:             money("quantity"),
  exWorkPrice:          money("ex_work_price"),
  freightCost:          money("freight_cost"),
  cifPrice:             money("cif_price"),
  taxRate:              money("tax_rate"),
  clearingCost:         money("clearing_cost"),
  warehouseCostPercent: money("warehouse_cost_percent"),
  landedCostPerUnit:    money("landed_cost_per_unit"),
  lineTotal:            money("line_total"),
  lineTotalThb:         money("line_total_thb"),
  quantityReceived:     money("quantity_received"),
  sortOrder:            integer("sort_order").default(0),
  itemData:             text("item_data", { mode: "json" }),
}, (t) => ({
  poIdx: index("po_items_po_idx").on(t.purchaseOrderId),
}))

// ─── PO Receipts ──────────────────────────────────────────────
// HARD DELETE

export const poReceipts = sqliteTable("po_receipts", {
  id:              pk(),
  tenantId:        tenantId(),
  purchaseOrderId: integer("purchase_order_id").notNull()
                     .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  receiptNumber:   text("receipt_number").notNull(),
  receivedDate:    text("received_date").default(sql`(date('now'))`),
  receivedBy:      text("received_by"),
  note:            text("note"),
  createdAt:       createdAt(),
}, (t) => ({
  poIdx: index("po_receipts_po_idx").on(t.purchaseOrderId),
}))

// ─── PO Receipt Items ─────────────────────────────────────────
// HARD DELETE — CASCADE จาก po_receipts

export const poReceiptItems = sqliteTable("po_receipt_items", {
  id:                pk(),
  tenantId:          tenantId(),
  receiptId:         integer("receipt_id").notNull()
                       .references(() => poReceipts.id, { onDelete: "cascade" }),
  poItemId:          integer("po_item_id").notNull()
                       .references(() => purchaseOrderItems.id),
  quantityReceived:  money("quantity_received"),
  lotNumber:         text("lot_number"),
  lotExpirationDate: text("lot_expiration_date"),
  location:          text("location"),
  note:              text("note"),
}, (t) => ({
  receiptIdx: index("po_receipt_items_receipt_idx").on(t.receiptId),
}))

// ─── PO History ───────────────────────────────────────────────
// HARD DELETE — log

export const poHistory = sqliteTable("po_history", {
  id:              pk(),
  tenantId:        tenantId(),
  purchaseOrderId: integer("purchase_order_id").notNull()
                     .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  action:          text("action").notNull(),
  oldStatus:       text("old_status"),
  newStatus:       text("new_status"),
  changedBy:       text("changed_by"),
  note:            text("note"),
  createdAt:       createdAt(),
}, (t) => ({
  poIdx: index("po_history_po_idx").on(t.purchaseOrderId),
}))

// ─── PO Approvals ─────────────────────────────────────────────
// HARD DELETE

export const poApprovals = sqliteTable("po_approvals", {
  id:              pk(),
  tenantId:        tenantId(),
  purchaseOrderId: integer("purchase_order_id").notNull()
                     .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  approverName:    text("approver_name").notNull(),
  decision:        text("decision").notNull(),
  amountThb:       decimal("amount_thb"),
  note:            text("note"),
  decidedAt:       text("decided_at").default(sql`(datetime('now'))`),
}, (t) => ({
  poIdx: index("po_approvals_po_idx").on(t.purchaseOrderId),
}))

// ─── Phase 6: Reporting & Notifications ───────────────────────

// Sales Targets — HARD DELETE
export const salesTargets = sqliteTable("sales_targets", {
  id:          pk(),
  tenantId:    tenantId(),
  userId:      integer("user_id"),
  periodType:  text("period_type").notNull(),   // month / quarter / year
  periodKey:   text("period_key").notNull(),     // "2026-10" / "2026-Q4" / "2026"
  metricType:  text("metric_type").notNull(),   // revenue / deal_count / win_rate
  targetValue: money("target_value"),
  createdAt:   createdAt(),
  updatedAt:   updatedAt(),
}, (t) => ({
  tenantPeriodIdx: index("targets_tenant_period_idx").on(t.tenantId, t.periodKey),
  tenantUnique:    uniqueIndex("targets_tenant_user_period_metric")
                     .on(t.tenantId, t.userId, t.periodKey, t.metricType),
}))

// Activity Log — HARD DELETE
export const activityLog = sqliteTable("activity_log", {
  id:           pk(),
  tenantId:     tenantId(),
  userId:       integer("user_id"),
  activityType: text("activity_type").notNull(),
  entityType:   text("entity_type"),
  entityId:     integer("entity_id"),
  value:        decimal("value"),
  metadata:     text("metadata", { mode: "json" }),
  occurredAt:   text("occurred_at").default(sql`(datetime('now'))`),
}, (t) => ({
  tenantOccurredIdx: index("activity_tenant_occurred_idx").on(t.tenantId, t.occurredAt),
  typeIdx:           index("activity_type_idx").on(t.tenantId, t.activityType),
  entityIdx:         index("activity_entity_idx").on(t.tenantId, t.entityType, t.entityId),
}))

// Quote Loss Reasons — HARD DELETE
export const quoteLossReasons = sqliteTable("quote_loss_reasons", {
  id:             pk(),
  tenantId:       tenantId(),
  quotationId:    integer("quotation_id").references(() => quotations.id),
  reasonType:     text("reason_type"),   // price / spec / timing / competitor / other
  competitorName: text("competitor_name"),
  notes:          text("notes"),
  lostAt:         text("lost_at").default(sql`(datetime('now'))`),
}, (t) => ({
  tenantIdx: index("loss_reasons_tenant_idx").on(t.tenantId),
  quoteIdx:  index("loss_reasons_quote_idx").on(t.quotationId),
}))

// Saved Reports — HARD DELETE
export const savedReports = sqliteTable("saved_reports", {
  id:         pk(),
  tenantId:   tenantId(),
  userId:     integer("user_id"),
  name:       text("name").notNull(),
  reportType: text("report_type").notNull(),
  filters:    text("filters", { mode: "json" }),
  lastRunAt:  text("last_run_at"),
  createdAt:  createdAt(),
}, (t) => ({
  tenantIdx: index("saved_reports_tenant_idx").on(t.tenantId),
}))

// Report Cache — HARD DELETE
export const reportCache = sqliteTable("report_cache", {
  id:         pk(),
  tenantId:   tenantId(),
  cacheKey:   text("cache_key").notNull(),
  data:       text("data", { mode: "json" }).notNull(),
  computedAt: text("computed_at").default(sql`(datetime('now'))`),
  expiresAt:  text("expires_at"),
}, (t) => ({
  tenantKeyIdx: uniqueIndex("report_cache_tenant_key").on(t.tenantId, t.cacheKey),
  expiresIdx:   index("report_cache_expires_idx").on(t.expiresAt),
}))

// Notifications — HARD DELETE
export const notifications = sqliteTable("notifications", {
  id:         pk(),
  tenantId:   tenantId(),
  userId:     integer("user_id"),
  type:       text("type").notNull(),
  severity:   text("severity").notNull().default("info"),
  title:      text("title").notNull(),
  message:    text("message").notNull(),
  entityType: text("entity_type"),
  entityId:   integer("entity_id"),
  link:       text("link"),
  isRead:     bool("is_read", false),
  readAt:     text("read_at"),
  createdAt:  createdAt(),
}, (t) => ({
  tenantReadIdx:    index("notifications_tenant_read_idx").on(t.tenantId, t.isRead),
  tenantCreatedIdx: index("notifications_tenant_created_idx").on(t.tenantId, t.createdAt),
  entityIdx:        index("notifications_entity_idx").on(t.tenantId, t.entityType, t.entityId),
}))
