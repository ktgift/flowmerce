import type {
  PoStatus,
  CreatePoItemInput,
  CreatePoInput,
  UpdatePoInput,
  CreateReceiptItemInput,
  CreateReceiptInput,
} from "shared"

export type {
  PoStatus,
  CreatePoItemInput,
  CreatePoInput,
  UpdatePoInput,
  CreateReceiptItemInput,
  CreateReceiptInput,
}

// ─── Frontend-only types ───────────────────────────────────────────

export interface PoFilter {
  status?:     PoStatus
  supplierId?: number
  search?:     string
}

// ─── Response shapes ─────────────────

export interface PoItem {
  id:                   number
  poId:                 number
  itemType:             string | null
  refId:                number | null
  name:                 string
  sku:                  string | null
  unit:                 string | null
  quantity:             number
  exWorkPrice:          number
  freightCost:          number | null
  cifPrice:             number | null
  taxRate:              number | null
  clearingCost:         number | null
  warehouseCostPercent: number | null
  sortOrder:            number | null
}

export interface ReceiptItem {
  id:                number
  receiptId:         number
  poItemId:          number
  quantityReceived:  number
  lotNumber:         string | null
  lotExpirationDate: string | null
  location:          string | null
  note:              string | null
}

export interface Receipt {
  id:            number
  poId:          number
  receiptNumber: string
  receivedDate:  string | null
  receivedBy:    string | null
  note:          string | null
  createdAt:     string
  items:         ReceiptItem[]
}

export interface PoHistoryEntry {
  id:         number
  poId:       number
  action:     string
  oldStatus:  PoStatus | null
  newStatus:  PoStatus | null
  changedBy:  string | null
  note:       string | null
  createdAt:  string
}

export interface PoListItem {
  id:           number
  poNumber:     string
  status:       PoStatus
  supplierId:   number | null
  supplierName: string | null
  currency:     string
  exchangeRate: number
  totalAmount:  number
  expectedDate: string | null
  createdAt:    string
  createdBy:    string | null
}

export interface PoDetail extends PoListItem {
  paymentTerm:    string | null
  deliveryTerm:   string | null
  shippingMethod: string | null
  remark:         string | null
  items:          PoItem[]
  receipts:       Receipt[]
  history:        PoHistoryEntry[]
}

export interface ReceiveItem extends PoItem {
  remainingQty: number
}

export interface PoStatusSummaryItem {
  status:   string
  count:    number
  totalThb: number
}

export interface PoSummary {
  byStatus:     PoStatusSummaryItem[]
  openCount:    number
  openTotalThb: number
}
