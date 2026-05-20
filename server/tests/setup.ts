// In-memory DB setup for integration tests.
// Import testDb from here and use it in tests that need real DB interaction.

import { Database } from "bun:sqlite"
import { drizzle }  from "drizzle-orm/bun-sqlite"
import * as schema  from "../src/db/schema"

const sqlite = new Database(":memory:")
export const testDb = drizzle(sqlite, { schema })

// Bootstrap tables inline (simplified — mirrors migrate.ts)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    vertical TEXT NOT NULL DEFAULT 'trader',
    settings TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  INSERT OR IGNORE INTO tenants (id, name) VALUES (1, 'Test');

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL DEFAULT 1,
    code TEXT, name TEXT NOT NULL, tax_id TEXT, address TEXT,
    phone TEXT, email TEXT, contact_person TEXT, notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL DEFAULT 1,
    quote_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    customer_id INTEGER, customer_name TEXT NOT NULL DEFAULT '',
    customer_company TEXT NOT NULL DEFAULT '',
    project_name TEXT, session_id TEXT, notes TEXT,
    subtotal REAL NOT NULL DEFAULT 0,
    vat_rate REAL NOT NULL DEFAULT 0.07,
    vat_amount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'THB',
    valid_until TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quotation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL REFERENCES quotations(id),
    product_id INTEGER, product_name TEXT NOT NULL,
    description TEXT,
    qty REAL NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    unit_price REAL NOT NULL DEFAULT 0,
    discount_pct REAL NOT NULL DEFAULT 0,
    line_total REAL NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL DEFAULT 1,
    user_id INTEGER, activity_type TEXT NOT NULL,
    entity_type TEXT, entity_id INTEGER,
    value REAL, metadata TEXT,
    occurred_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS report_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL DEFAULT 1,
    cache_key TEXT NOT NULL, data TEXT NOT NULL,
    computed_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
  );
`)
