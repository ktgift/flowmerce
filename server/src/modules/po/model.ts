export type PoStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "sent_to_supplier"
  | "partial_received"
  | "received"
  | "closed"
  | "cancelled"
  | "rejected"

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
  supplierId?:   number | null
  currency?:     string
  exchangeRate?: number
  paymentTerm?:  string | null
  deliveryTerm?: string | null
  expectedDate?: string | null
  remark?:       string | null
  createdBy?:    string | null
  items:         CreatePoItemInput[]
}

export interface UpdatePoInput {
  supplierId?:   number | null
  currency?:     string
  exchangeRate?: number
  paymentTerm?:  string | null
  deliveryTerm?: string | null
  expectedDate?: string | null
  remark?:       string | null
  items?:        CreatePoItemInput[]
}

export interface CreateReceiptItemInput {
  poItemId:         number
  quantityReceived: number
  lotNumber?:       string | null
  lotExpirationDate?: string | null
  location?:        string | null
  note?:            string | null
}

export interface CreateReceiptInput {
  receiptNumber: string
  receivedDate?: string | null
  receivedBy?:   string | null
  note?:         string | null
  items:         CreateReceiptItemInput[]
}
