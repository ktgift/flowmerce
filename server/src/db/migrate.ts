import { Database } from "bun:sqlite"
import { DEFAULT_TENANT_ID } from "shared"

export function runMigrations(sqlite: Database) {
  // ── Existing tables (backward compatible) ─────────────────
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      vertical   TEXT NOT NULL DEFAULT 'trader',
      settings   TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS file_chunks (
      id          TEXT PRIMARY KEY,
      session_id  TEXT NOT NULL,
      file_name   TEXT NOT NULL,
      file_type   TEXT NOT NULL,
      sheet_name  TEXT,
      row_start   INTEGER,
      row_end     INTEGER,
      page_number INTEGER,
      chunk_index INTEGER,
      content     TEXT NOT NULL,
      preview     TEXT NOT NULL,
      embedding   TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS mail_tokens (
      id            TEXT PRIMARY KEY,
      session_id    TEXT NOT NULL,
      provider      TEXT NOT NULL,
      access_token  TEXT NOT NULL,
      refresh_token TEXT,
      expires_at    INTEGER NOT NULL,
      email         TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS emails (
      id          TEXT PRIMARY KEY,
      session_id  TEXT NOT NULL,
      provider    TEXT NOT NULL,
      from_email  TEXT NOT NULL,
      from_name   TEXT NOT NULL DEFAULT '',
      subject     TEXT NOT NULL,
      body_text   TEXT NOT NULL,
      received_at TEXT NOT NULL,
      fetched_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS drafts (
      id         TEXT PRIMARY KEY,
      email_id   TEXT NOT NULL REFERENCES emails(id),
      session_id TEXT NOT NULL,
      draft_body TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'pending',
      sent_at    TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_chunks_session ON file_chunks(session_id);
    CREATE INDEX IF NOT EXISTS idx_tokens_session ON mail_tokens(session_id);
    CREATE INDEX IF NOT EXISTS idx_emails_session ON emails(session_id);
    CREATE INDEX IF NOT EXISTS idx_drafts_email   ON drafts(email_id);
    CREATE INDEX IF NOT EXISTS idx_drafts_session ON drafts(session_id);
  `)

  // Add tenant_id to existing tables (ignore error if column already exists)
  for (const stmt of [
    `ALTER TABLE file_chunks ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID}`,
    `ALTER TABLE mail_tokens ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID}`,
    `ALTER TABLE emails      ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID}`,
    `ALTER TABLE drafts      ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID}`,
    // Phase 3+: add supplier_id to quotations
    `ALTER TABLE quotations ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id)`,
  ]) {
    try { sqlite.run(stmt) } catch { /* column already exists */ }
  }

  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS chunks_tenant_session_idx ON file_chunks(tenant_id, session_id);
    CREATE INDEX IF NOT EXISTS tokens_tenant_session_idx ON mail_tokens(tenant_id, session_id);
    CREATE INDEX IF NOT EXISTS emails_tenant_session_idx ON emails(tenant_id, session_id);
    CREATE INDEX IF NOT EXISTS drafts_tenant_idx         ON drafts(tenant_id);
  `)

  // ── Phase 1: Master Data ──────────────────────────────────
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id      INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      code           TEXT,
      name           TEXT NOT NULL,
      tax_id         TEXT,
      address        TEXT,
      phone          TEXT,
      email          TEXT,
      contact_person TEXT,
      notes          TEXT,
      is_active      INTEGER NOT NULL DEFAULT 1,
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT DEFAULT (datetime('now')),
      deleted_at     TEXT
    );
    CREATE INDEX IF NOT EXISTS suppliers_tenant_idx ON suppliers(tenant_id);

    CREATE TABLE IF NOT EXISTS customers (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id      INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      code           TEXT,
      name           TEXT NOT NULL,
      tax_id         TEXT,
      address        TEXT,
      phone          TEXT,
      email          TEXT,
      contact_person TEXT,
      notes          TEXT,
      is_active      INTEGER NOT NULL DEFAULT 1,
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT DEFAULT (datetime('now')),
      deleted_at     TEXT
    );
    CREATE INDEX IF NOT EXISTS customers_tenant_idx ON customers(tenant_id);
  `)

  // ── Phase 2: Import / Trader Products ─────────────────────
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS trader_products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id   INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      code        TEXT,
      name        TEXT NOT NULL,
      description TEXT,
      unit        TEXT NOT NULL DEFAULT 'pcs',
      category    TEXT,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now')),
      deleted_at  TEXT
    );
    CREATE INDEX IF NOT EXISTS tp_tenant_idx ON trader_products(tenant_id);

    CREATE TABLE IF NOT EXISTS product_prices (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id      INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      product_id     INTEGER NOT NULL REFERENCES trader_products(id),
      supplier_id    INTEGER REFERENCES suppliers(id),
      cost_price     REAL NOT NULL DEFAULT 0,
      sell_price     REAL NOT NULL DEFAULT 0,
      effective_date TEXT,
      is_current     INTEGER NOT NULL DEFAULT 1,
      created_at     TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS pp_tenant_product_idx ON product_prices(tenant_id, product_id);

    CREATE TABLE IF NOT EXISTS product_inventory (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id    INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      product_id   INTEGER NOT NULL REFERENCES trader_products(id),
      qty_on_hand  REAL NOT NULL DEFAULT 0,
      qty_reserved REAL NOT NULL DEFAULT 0,
      location     TEXT,
      updated_at   TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS inv_tenant_product_idx ON product_inventory(tenant_id, product_id);

    CREATE TABLE IF NOT EXISTS import_templates (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id      INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      name           TEXT NOT NULL,
      target_table   TEXT NOT NULL,
      column_mapping TEXT NOT NULL,
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS it_tenant_idx ON import_templates(tenant_id);

    CREATE TABLE IF NOT EXISTS import_logs (
      id           TEXT PRIMARY KEY,
      tenant_id    INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      template_id  INTEGER,
      file_name    TEXT NOT NULL,
      total_rows   INTEGER NOT NULL DEFAULT 0,
      success_rows INTEGER NOT NULL DEFAULT 0,
      failed_rows  INTEGER NOT NULL DEFAULT 0,
      errors       TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS il_tenant_idx ON import_logs(tenant_id);
  `)

  // ── Phase 3: Quotations ────────────────────────────────────
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS quotations (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id        INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      quote_number     TEXT NOT NULL,
      status           TEXT NOT NULL DEFAULT 'draft',
      customer_id      INTEGER,
      customer_name    TEXT NOT NULL,
      customer_company TEXT NOT NULL,
      project_name     TEXT,
      session_id       TEXT,
      notes            TEXT,
      subtotal         REAL NOT NULL DEFAULT 0,
      vat_rate         REAL NOT NULL DEFAULT 0.07,
      vat_amount       REAL NOT NULL DEFAULT 0,
      total            REAL NOT NULL DEFAULT 0,
      currency         TEXT NOT NULL DEFAULT 'THB',
      valid_until      TEXT,
      created_at       TEXT DEFAULT (datetime('now')),
      updated_at       TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS quotations_tenant_idx     ON quotations(tenant_id);
    CREATE INDEX IF NOT EXISTS quotations_tenant_num_idx ON quotations(tenant_id, quote_number);

    CREATE TABLE IF NOT EXISTS quotation_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER NOT NULL REFERENCES quotations(id),
      product_id   INTEGER,
      product_name TEXT NOT NULL,
      description  TEXT,
      qty          REAL NOT NULL DEFAULT 1,
      unit         TEXT NOT NULL DEFAULT 'pcs',
      unit_price   REAL NOT NULL DEFAULT 0,
      discount_pct REAL NOT NULL DEFAULT 0,
      line_total   REAL NOT NULL DEFAULT 0,
      sort_order   INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS qi_quotation_idx ON quotation_items(quotation_id);

    CREATE TABLE IF NOT EXISTS quotation_history (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER NOT NULL REFERENCES quotations(id),
      action       TEXT NOT NULL,
      changed_by   TEXT,
      snapshot     TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS qh_quotation_idx ON quotation_history(quotation_id);
  `)

  // ── Phase 5: Purchase Orders ──────────────────────────────
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id           INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      vertical            TEXT NOT NULL DEFAULT 'trader',
      po_number           TEXT NOT NULL,
      supplier_id         INTEGER REFERENCES suppliers(id),
      source_quotation_id INTEGER REFERENCES quotations(id),
      status              TEXT NOT NULL DEFAULT 'draft',
      currency            TEXT DEFAULT 'USD',
      exchange_rate       REAL NOT NULL DEFAULT 0,
      payment_term        TEXT,
      delivery_term       TEXT,
      expected_date       TEXT,
      remark              TEXT,
      created_by          TEXT,
      approved_by         TEXT,
      subtotal            REAL NOT NULL DEFAULT 0,
      subtotal_thb        REAL NOT NULL DEFAULT 0,
      total_landed_cost   REAL NOT NULL DEFAULT 0,
      issued_date         TEXT DEFAULT (date('now')),
      created_at          TEXT DEFAULT (datetime('now')),
      updated_at          TEXT DEFAULT (datetime('now')),
      deleted_at          TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS po_tenant_number ON purchase_orders(tenant_id, po_number);
    CREATE INDEX IF NOT EXISTS po_tenant_idx    ON purchase_orders(tenant_id);
    CREATE INDEX IF NOT EXISTS po_supplier_idx  ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS po_status_idx    ON purchase_orders(tenant_id, status);

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id             INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      purchase_order_id     INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      item_type             TEXT NOT NULL DEFAULT 'trader_product',
      ref_id                INTEGER,
      name                  TEXT NOT NULL,
      sku                   TEXT,
      unit                  TEXT,
      quantity              REAL NOT NULL DEFAULT 0,
      ex_work_price         REAL NOT NULL DEFAULT 0,
      freight_cost          REAL NOT NULL DEFAULT 0,
      cif_price             REAL NOT NULL DEFAULT 0,
      tax_rate              REAL NOT NULL DEFAULT 0,
      clearing_cost         REAL NOT NULL DEFAULT 0,
      warehouse_cost_percent REAL NOT NULL DEFAULT 0,
      landed_cost_per_unit  REAL NOT NULL DEFAULT 0,
      line_total            REAL NOT NULL DEFAULT 0,
      line_total_thb        REAL NOT NULL DEFAULT 0,
      quantity_received     REAL NOT NULL DEFAULT 0,
      sort_order            INTEGER DEFAULT 0,
      item_data             TEXT
    );
    CREATE INDEX IF NOT EXISTS po_items_po_idx ON purchase_order_items(purchase_order_id);

    CREATE TABLE IF NOT EXISTS po_receipts (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id        INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      receipt_number   TEXT NOT NULL,
      received_date    TEXT DEFAULT (date('now')),
      received_by      TEXT,
      note             TEXT,
      created_at       TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS po_receipts_po_idx ON po_receipts(purchase_order_id);

    CREATE TABLE IF NOT EXISTS po_receipt_items (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id         INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      receipt_id        INTEGER NOT NULL REFERENCES po_receipts(id) ON DELETE CASCADE,
      po_item_id        INTEGER NOT NULL REFERENCES purchase_order_items(id),
      quantity_received REAL NOT NULL DEFAULT 0,
      lot_number        TEXT,
      lot_expiration_date TEXT,
      location          TEXT,
      note              TEXT
    );
    CREATE INDEX IF NOT EXISTS po_receipt_items_receipt_idx ON po_receipt_items(receipt_id);

    CREATE TABLE IF NOT EXISTS po_history (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id        INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      action           TEXT NOT NULL,
      old_status       TEXT,
      new_status       TEXT,
      changed_by       TEXT,
      note             TEXT,
      created_at       TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS po_history_po_idx ON po_history(purchase_order_id);

    CREATE TABLE IF NOT EXISTS po_approvals (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id        INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      approver_name    TEXT NOT NULL,
      decision         TEXT NOT NULL,
      amount_thb       REAL,
      note             TEXT,
      decided_at       TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS po_approvals_po_idx ON po_approvals(purchase_order_id);
  `)

  // ── Phase 6: Reporting & Notifications ───────────────────────
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sales_targets (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id    INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      user_id      INTEGER,
      period_type  TEXT NOT NULL,
      period_key   TEXT NOT NULL,
      metric_type  TEXT NOT NULL,
      target_value REAL NOT NULL DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS targets_tenant_period_idx ON sales_targets(tenant_id, period_key);
    CREATE UNIQUE INDEX IF NOT EXISTS targets_tenant_user_period_metric
      ON sales_targets(tenant_id, user_id, period_key, metric_type);

    CREATE TABLE IF NOT EXISTS activity_log (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id     INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      user_id       INTEGER,
      activity_type TEXT NOT NULL,
      entity_type   TEXT,
      entity_id     INTEGER,
      value         REAL,
      metadata      TEXT,
      occurred_at   TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS activity_tenant_occurred_idx ON activity_log(tenant_id, occurred_at);
    CREATE INDEX IF NOT EXISTS activity_type_idx            ON activity_log(tenant_id, activity_type);
    CREATE INDEX IF NOT EXISTS activity_entity_idx          ON activity_log(tenant_id, entity_type, entity_id);

    CREATE TABLE IF NOT EXISTS quote_loss_reasons (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id       INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      quotation_id    INTEGER REFERENCES quotations(id),
      reason_type     TEXT,
      competitor_name TEXT,
      notes           TEXT,
      lost_at         TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS loss_reasons_tenant_idx ON quote_loss_reasons(tenant_id);
    CREATE INDEX IF NOT EXISTS loss_reasons_quote_idx  ON quote_loss_reasons(quotation_id);

    CREATE TABLE IF NOT EXISTS saved_reports (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id   INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      user_id     INTEGER,
      name        TEXT NOT NULL,
      report_type TEXT NOT NULL,
      filters     TEXT,
      last_run_at TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS saved_reports_tenant_idx ON saved_reports(tenant_id);

    CREATE TABLE IF NOT EXISTS report_cache (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id   INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      cache_key   TEXT NOT NULL,
      data        TEXT NOT NULL,
      computed_at TEXT DEFAULT (datetime('now')),
      expires_at  TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS report_cache_tenant_key ON report_cache(tenant_id, cache_key);
    CREATE INDEX IF NOT EXISTS report_cache_expires_idx       ON report_cache(expires_at);

    CREATE TABLE IF NOT EXISTS notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id   INTEGER NOT NULL DEFAULT ${DEFAULT_TENANT_ID},
      user_id     INTEGER,
      type        TEXT NOT NULL,
      severity    TEXT NOT NULL DEFAULT 'info',
      title       TEXT NOT NULL,
      message     TEXT NOT NULL,
      entity_type TEXT,
      entity_id   INTEGER,
      link        TEXT,
      is_read     INTEGER NOT NULL DEFAULT 0,
      read_at     TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS notifications_tenant_read_idx    ON notifications(tenant_id, is_read);
    CREATE INDEX IF NOT EXISTS notifications_tenant_created_idx ON notifications(tenant_id, created_at);
    CREATE INDEX IF NOT EXISTS notifications_entity_idx         ON notifications(tenant_id, entity_type, entity_id);
  `)

  // Seed default tenant (id = 1) if not exists
  sqlite
    .prepare(`INSERT OR IGNORE INTO tenants (id, name, vertical) VALUES (?, 'Default', 'trader')`)
    .run(DEFAULT_TENANT_ID)
}
