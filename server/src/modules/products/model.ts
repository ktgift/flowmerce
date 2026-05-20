export interface ProductRecord {
  id:          number
  tenantId:    number
  code:        string | null
  name:        string
  description: string | null
  unit:        string
  category:    string | null
  isActive:    boolean
  createdAt:   string | null
  updatedAt:   string | null
  deletedAt:   string | null
}

export interface PriceRecord {
  id:            number
  tenantId:      number
  productId:     number
  supplierId:    number | null
  costPrice:     number
  sellPrice:     number
  effectiveDate: string | null
  isCurrent:     boolean
  createdAt:     string | null
}

export interface InventoryRecord {
  id:          number
  tenantId:    number
  productId:   number
  qtyOnHand:   number
  qtyReserved: number
  location:    string | null
  updatedAt:   string | null
}

export interface ProductWithPrice extends ProductRecord {
  sellPrice:  number
  costPrice:  number
  qtyOnHand:  number
}

export type NewProduct     = Omit<ProductRecord, "id" | "createdAt" | "updatedAt" | "deletedAt">
export type UpdateProduct  = Partial<Omit<NewProduct, "tenantId">>
