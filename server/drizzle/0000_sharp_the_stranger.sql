CREATE TABLE `activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`user_id` integer,
	`activity_type` text NOT NULL,
	`entity_type` text,
	`entity_id` integer,
	`value` real,
	`metadata` text,
	`occurred_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `activity_tenant_occurred_idx` ON `activity_log` (`tenant_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `activity_type_idx` ON `activity_log` (`tenant_id`,`activity_type`);--> statement-breakpoint
CREATE INDEX `activity_entity_idx` ON `activity_log` (`tenant_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`tax_id` text,
	`address` text,
	`phone` text,
	`email` text,
	`contact_person` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `customers_tenant_idx` ON `customers` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`email_id` text NOT NULL,
	`session_id` text NOT NULL,
	`draft_body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`sent_at` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `drafts_tenant_idx` ON `drafts` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `emails` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`session_id` text NOT NULL,
	`provider` text NOT NULL,
	`from_email` text NOT NULL,
	`from_name` text DEFAULT '' NOT NULL,
	`subject` text NOT NULL,
	`body_text` text NOT NULL,
	`received_at` text NOT NULL,
	`fetched_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `emails_tenant_session_idx` ON `emails` (`tenant_id`,`session_id`);--> statement-breakpoint
CREATE TABLE `file_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`session_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`sheet_name` text,
	`row_start` integer,
	`row_end` integer,
	`page_number` integer,
	`chunk_index` integer,
	`content` text NOT NULL,
	`preview` text NOT NULL,
	`embedding` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `chunks_tenant_session_idx` ON `file_chunks` (`tenant_id`,`session_id`);--> statement-breakpoint
CREATE TABLE `mail_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`session_id` text NOT NULL,
	`provider` text NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`expires_at` integer NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `tokens_tenant_session_idx` ON `mail_tokens` (`tenant_id`,`session_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`user_id` integer,
	`type` text NOT NULL,
	`severity` text DEFAULT 'info' NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`entity_type` text,
	`entity_id` integer,
	`link` text,
	`is_read` integer DEFAULT false NOT NULL,
	`read_at` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `notifications_tenant_read_idx` ON `notifications` (`tenant_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `notifications_tenant_created_idx` ON `notifications` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_entity_idx` ON `notifications` (`tenant_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `po_approvals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`purchase_order_id` integer NOT NULL,
	`approver_name` text NOT NULL,
	`decision` text NOT NULL,
	`amount_thb` real,
	`note` text,
	`decided_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `po_approvals_po_idx` ON `po_approvals` (`purchase_order_id`);--> statement-breakpoint
CREATE TABLE `po_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`purchase_order_id` integer NOT NULL,
	`action` text NOT NULL,
	`old_status` text,
	`new_status` text,
	`changed_by` text,
	`note` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `po_history_po_idx` ON `po_history` (`purchase_order_id`);--> statement-breakpoint
CREATE TABLE `po_receipt_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`receipt_id` integer NOT NULL,
	`po_item_id` integer NOT NULL,
	`quantity_received` real DEFAULT 0 NOT NULL,
	`lot_number` text,
	`lot_expiration_date` text,
	`location` text,
	`note` text,
	FOREIGN KEY (`receipt_id`) REFERENCES `po_receipts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`po_item_id`) REFERENCES `purchase_order_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `po_receipt_items_receipt_idx` ON `po_receipt_items` (`receipt_id`);--> statement-breakpoint
CREATE TABLE `po_receipts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`purchase_order_id` integer NOT NULL,
	`receipt_number` text NOT NULL,
	`received_date` text DEFAULT (date('now')),
	`received_by` text,
	`note` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `po_receipts_po_idx` ON `po_receipts` (`purchase_order_id`);--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`purchase_order_id` integer NOT NULL,
	`item_type` text DEFAULT 'trader_product' NOT NULL,
	`ref_id` integer,
	`name` text NOT NULL,
	`sku` text,
	`unit` text,
	`quantity` real DEFAULT 0 NOT NULL,
	`ex_work_price` real DEFAULT 0 NOT NULL,
	`freight_cost` real DEFAULT 0 NOT NULL,
	`cif_price` real DEFAULT 0 NOT NULL,
	`tax_rate` real DEFAULT 0 NOT NULL,
	`clearing_cost` real DEFAULT 0 NOT NULL,
	`warehouse_cost_percent` real DEFAULT 0 NOT NULL,
	`landed_cost_per_unit` real DEFAULT 0 NOT NULL,
	`line_total` real DEFAULT 0 NOT NULL,
	`line_total_thb` real DEFAULT 0 NOT NULL,
	`quantity_received` real DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0,
	`item_data` text,
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `po_items_po_idx` ON `purchase_order_items` (`purchase_order_id`);--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`vertical` text DEFAULT 'trader' NOT NULL,
	`po_number` text NOT NULL,
	`supplier_id` integer,
	`source_quotation_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`currency` text DEFAULT 'USD',
	`exchange_rate` real DEFAULT 0 NOT NULL,
	`payment_term` text,
	`delivery_term` text,
	`expected_date` text,
	`remark` text,
	`created_by` text,
	`approved_by` text,
	`subtotal` real DEFAULT 0 NOT NULL,
	`subtotal_thb` real DEFAULT 0 NOT NULL,
	`total_landed_cost` real DEFAULT 0 NOT NULL,
	`issued_date` text DEFAULT (date('now')),
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`deleted_at` text,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_quotation_id`) REFERENCES `quotations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `po_tenant_number` ON `purchase_orders` (`tenant_id`,`po_number`);--> statement-breakpoint
CREATE INDEX `po_tenant_idx` ON `purchase_orders` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `po_supplier_idx` ON `purchase_orders` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `po_status_idx` ON `purchase_orders` (`tenant_id`,`status`);--> statement-breakpoint
CREATE TABLE `quotation_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quotation_id` integer NOT NULL,
	`action` text NOT NULL,
	`changed_by` text,
	`snapshot` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `qh_quotation_idx` ON `quotation_history` (`quotation_id`);--> statement-breakpoint
CREATE TABLE `quotation_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quotation_id` integer NOT NULL,
	`product_id` integer,
	`product_name` text NOT NULL,
	`description` text,
	`qty` real DEFAULT 1 NOT NULL,
	`unit` text DEFAULT 'pcs' NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL,
	`discount_pct` real DEFAULT 0 NOT NULL,
	`line_total` real DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `qi_quotation_idx` ON `quotation_items` (`quotation_id`);--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`quote_number` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`customer_id` integer,
	`supplier_id` integer,
	`customer_name` text NOT NULL,
	`customer_company` text NOT NULL,
	`project_name` text,
	`session_id` text,
	`notes` text,
	`subtotal` real DEFAULT 0 NOT NULL,
	`vat_rate` real DEFAULT 0.07 NOT NULL,
	`vat_amount` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'THB' NOT NULL,
	`valid_until` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quotations_tenant_idx` ON `quotations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `quotations_tenant_num_idx` ON `quotations` (`tenant_id`,`quote_number`);--> statement-breakpoint
CREATE TABLE `quote_loss_reasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`quotation_id` integer,
	`reason_type` text,
	`competitor_name` text,
	`notes` text,
	`lost_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `loss_reasons_tenant_idx` ON `quote_loss_reasons` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `loss_reasons_quote_idx` ON `quote_loss_reasons` (`quotation_id`);--> statement-breakpoint
CREATE TABLE `report_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`cache_key` text NOT NULL,
	`data` text NOT NULL,
	`computed_at` text DEFAULT (datetime('now')),
	`expires_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `report_cache_tenant_key` ON `report_cache` (`tenant_id`,`cache_key`);--> statement-breakpoint
CREATE INDEX `report_cache_expires_idx` ON `report_cache` (`expires_at`);--> statement-breakpoint
CREATE TABLE `sales_targets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`user_id` integer,
	`period_type` text NOT NULL,
	`period_key` text NOT NULL,
	`metric_type` text NOT NULL,
	`target_value` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `targets_tenant_period_idx` ON `sales_targets` (`tenant_id`,`period_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `targets_tenant_user_period_metric` ON `sales_targets` (`tenant_id`,`user_id`,`period_key`,`metric_type`);--> statement-breakpoint
CREATE TABLE `saved_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`report_type` text NOT NULL,
	`filters` text,
	`last_run_at` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `saved_reports_tenant_idx` ON `saved_reports` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`tax_id` text,
	`address` text,
	`phone` text,
	`email` text,
	`contact_person` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `suppliers_tenant_idx` ON `suppliers` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`vertical` text DEFAULT 'trader' NOT NULL,
	`settings` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `import_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`template_id` integer,
	`file_name` text NOT NULL,
	`total_rows` integer DEFAULT 0 NOT NULL,
	`success_rows` integer DEFAULT 0 NOT NULL,
	`failed_rows` integer DEFAULT 0 NOT NULL,
	`errors` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `il_tenant_idx` ON `import_logs` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `import_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`name` text NOT NULL,
	`target_table` text NOT NULL,
	`column_mapping` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `it_tenant_idx` ON `import_templates` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `product_inventory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`product_id` integer NOT NULL,
	`qty_on_hand` real DEFAULT 0 NOT NULL,
	`qty_reserved` real DEFAULT 0 NOT NULL,
	`location` text,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`product_id`) REFERENCES `trader_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `inv_tenant_product_idx` ON `product_inventory` (`tenant_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `product_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`product_id` integer NOT NULL,
	`supplier_id` integer,
	`cost_price` real DEFAULT 0 NOT NULL,
	`sell_price` real DEFAULT 0 NOT NULL,
	`effective_date` text,
	`is_current` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`product_id`) REFERENCES `trader_products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pp_tenant_product_idx` ON `product_prices` (`tenant_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `trader_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1 NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`description` text,
	`unit` text DEFAULT 'pcs' NOT NULL,
	`category` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `tp_tenant_idx` ON `trader_products` (`tenant_id`);