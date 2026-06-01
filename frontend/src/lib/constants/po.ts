import dayjs from "dayjs"

import type { PoStatus, ReceiveItem }      from "@/lib/@types/po"
import type { ReceiptCreateFormValues }    from "@/lib/schema/po.schema"
import { COLORS } from "./colors"

export const PO_STATUS_LABEL: Record<PoStatus, string> = {
  draft:            "Draft",
  issued:           "Issued",
  acknowledged:     "Acknowledged",
  partial_received: "Partially Received",
  received:         "Fully Received",
  closed:           "Closed",
  cancelled:        "Cancelled",
  // Phase 2 — approval flow (not yet implemented)
  // pending_approval: "Pending",
  // approved:         "Approved",
  // sent_to_supplier: "Sent",
  // rejected:         "Rejected",
}

export const PO_STATUS_DESCRIPTION: Partial<Record<PoStatus, string>> = {
  draft:
    "Draft — Saved but PDF has not been exported and sent to the supplier yet.",
  issued:
    "Issued — PDF exported and sent to the supplier. Waiting for supplier acknowledgement.",
  acknowledged:
    "Acknowledged — Supplier has signed and confirmed receipt of this PO, agreed on delivery schedule and pricing.",
  partial_received:
    "Partially Received — Some items from this PO have started arriving, but the full quantity has not been received yet.",
  received:
    "Fully Received — All items have been delivered and inspected into the warehouse as specified in this PO.",
  closed:
    "Closed — Process complete. All documents and accounts have been settled.",
  cancelled:
    "Cancelled — Purchase order will not proceed (supplier out of stock, plan changed, etc.).",
}

/** Statuses set automatically by the system (not user-selectable in the modal) */
export const PO_AUTO_STATUSES: PoStatus[] = ["draft", "issued"]

/** Statuses the user can manually select in the status modal */
export const PO_MANUAL_STATUSES: PoStatus[] = [
  "acknowledged",
  "partial_received",
  "received",
  "closed",
  "cancelled",
]

/** Valid manual status transitions per current status (frontend enforcement) */
export const PO_VALID_MANUAL_TRANSITIONS: Partial<Record<PoStatus, PoStatus[]>> = {
  draft:            ["cancelled"],
  issued:           ["acknowledged", "cancelled"],
  acknowledged:     ["partial_received", "received", "cancelled"],
  partial_received: ["received", "closed", "cancelled"],
  received:         ["closed"],
  closed:           [],
  cancelled:        [],
  // Phase 2 — approval flow (not yet implemented)
  // pending_approval: ["cancelled"],
  // approved:         ["cancelled"],
  // sent_to_supplier: ["acknowledged", "partial_received", "received", "cancelled"],
  // rejected:         [],
}

export const PO_STATUS_LIST: PoStatus[] = [
  "draft",
  "issued",
  "acknowledged",
  "partial_received",
  "received",
  "closed",
  "cancelled",
  // Phase 2 — approval flow (not yet implemented)
  // "pending_approval",
  // "approved",
  // "sent_to_supplier",
  // "rejected",
]

/** Ordered steps shown in the status timeline */
export const PO_TIMELINE_STEPS: { status: PoStatus; label: string }[] = [
  { status: "draft",            label: "Draft" },
  { status: "issued",           label: "Issued" },
  { status: "acknowledged",     label: "Acknowledged" },
  { status: "partial_received", label: "Receiving" },
  { status: "received",         label: "Received" },
  { status: "closed",           label: "Closed" },
]

/** Filter tabs shown in the PO list page */
export const PO_FILTER_TABS: { value: PoStatus | ""; label: string }[] = [
  { value: "",                 label: "All" },
  { value: "draft",            label: PO_STATUS_LABEL.draft },
  { value: "issued",           label: PO_STATUS_LABEL.issued },
  { value: "acknowledged",     label: PO_STATUS_LABEL.acknowledged },
  { value: "partial_received", label: PO_STATUS_LABEL.partial_received },
  { value: "received",         label: PO_STATUS_LABEL.received },
  { value: "closed",           label: PO_STATUS_LABEL.closed },
  { value: "cancelled",        label: PO_STATUS_LABEL.cancelled },
]

/** Dot color for each history action type */
export const PO_HISTORY_ACTION_COLOR: Record<string, string> = {
  created:       COLORS.primary,
  status_change: COLORS.secondary,
  edited:        COLORS.warning,
  deleted:       COLORS.error,
  receipt_added: COLORS.success,
  pdf_exported:  COLORS.neutral,
}

/** Human-readable label template per history action */
export const PO_HISTORY_ACTION_LABEL: Record<string, (actor: string) => string> = {
  created:       (actor) => `${actor} created Draft`,
  edited:        (actor) => `${actor} updated PO`,
  deleted:       (actor) => `${actor} deleted PO`,
  // Phase 2 — approval flow (not yet implemented)
  // approved:      (actor) => `${actor} approved PO`,
  sent:          (actor) => `${actor} sent PO to supplier`,
  receipt_added: (actor) => `${actor} added goods receipt`,
  pdf_exported:  (actor) => `${actor} exported PDF`,
}

export const PO_PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export const PO_SUMMARY_STATUS_ORDER: string[] = [
  ...PO_TIMELINE_STEPS.map((s) => s.status),
  "cancelled",
  // Phase 2 — approval flow (not yet implemented)
  // "pending_approval",
  // "approved",
  // "sent_to_supplier",
  // "rejected",
]

export const PO_DELIVERY_TERMS = [
  "FOB Singapore",
  "CIF Bangkok",
  "EXW",
  "DDP",
] as const

export const PO_PAYMENT_TERMS = [
  "Net 30",
  "Net 45",
  "Net 60",
  "T/T Advance",
] as const

export const PO_SHIPPING_METHODS = [
  { value: "Sea",     emoji: "🚢" },
  { value: "Air",     emoji: "✈" },
  { value: "Truck",   emoji: "🚛" },
  { value: "Courier", emoji: "📦" },
] as const

export type PoDeliveryTerm  = typeof PO_DELIVERY_TERMS[number]
export type PoPaymentTerm   = typeof PO_PAYMENT_TERMS[number]
export type PoShippingMethod = typeof PO_SHIPPING_METHODS[number]["value"]

export const DEFAULT_EXCHANGE_RATE = 36.6
export const DEFAULT_CURRENCY      = "USD"

export const PO_CREATE_DEFAULTS = {
  currency:       DEFAULT_CURRENCY,
  exchangeRate:   DEFAULT_EXCHANGE_RATE,
  paymentTerm:    "Net 30" as string,
  deliveryTerm:   "FOB Singapore" as string,
  shippingMethod: "Sea" as string,
  items:          [] as never[],
} as const

export function buildReceiptDefaultValues(items: ReceiveItem[]): ReceiptCreateFormValues {
  return {
    receiptNumber: "",
    receivedDate:  dayjs().format("YYYY-MM-DD"),
    receivedBy:    "",
    note:          "",
    items: items.map((item) => ({
      poItemId:          item.id,
      quantityReceived:  item.remainingQty,
      lotNumber:         "",
      lotExpirationDate: "",
      location:          "",
    })),
  }
}

export const HEAD_CELLS = [
  { id: "product",  label: "Product",    align: "left"  as const },
  { id: "qty",      label: "Qty",        align: "right" as const },
  { id: "exWork",   label: "Ex-Work",    align: "right" as const },
  { id: "freight",  label: "Freight",    align: "right" as const },
  { id: "cifUSD",   label: "CIF (USD)",  align: "right" as const },
  { id: "cifTHB",   label: "CIF (THB)",  align: "right" as const },
  { id: "tax",      label: "Tax",        align: "right" as const },
  { id: "clearing", label: "Clearing",   align: "right" as const },
  { id: "wh",       label: "WH %",       align: "right" as const },
  { id: "landed",   label: "Landed / U", align: "right" as const },
  { id: "total",    label: "Line Total", align: "right" as const },
]
