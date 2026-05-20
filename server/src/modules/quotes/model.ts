export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "cancelled"

export interface QuotationRecord {
  id:              number
  tenantId:        number
  quoteNumber:     string
  status:          QuoteStatus
  customerId:      number | null
  supplierId:      number | null
  customerName:    string
  customerCompany: string
  projectName:     string | null
  sessionId:       string | null
  notes:           string | null
  subtotal:        number
  vatRate:         number
  vatAmount:       number
  total:           number
  currency:        string
  validUntil:      string | null
  createdAt:       string | null
  updatedAt:       string | null
}

export interface QuotationItemRecord {
  id:          number
  quotationId: number
  productId:   number | null
  productName: string
  description: string | null
  qty:         number
  unit:        string
  unitPrice:   number
  discountPct: number
  lineTotal:   number
  sortOrder:   number
}

export interface QuotationWithItems extends QuotationRecord {
  items: QuotationItemRecord[]
}

export interface CreateQuoteItemDto {
  productId?:   number
  productName:  string
  description?: string
  qty:          number
  unit:         string
  unitPrice:    number
  discountPct?: number
}

export interface CreateQuoteDto {
  sessionId?:      string
  customerId?:     number
  supplierId?:     number
  customerName:    string
  customerCompany: string
  projectName?:    string
  notes?:          string
  vatRate?:        number
  currency?:       string
  validUntil?:     string
  items:           CreateQuoteItemDto[]
}

export type UpdateQuoteDto = Partial<Omit<CreateQuoteDto, "items">>
