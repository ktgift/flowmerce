export interface SupplierRecord {
  id:            number
  tenantId:      number
  code:          string | null
  name:          string
  taxId:         string | null
  address:       string | null
  phone:         string | null
  email:         string | null
  contactPerson: string | null
  notes:         string | null
  isActive:      boolean
  createdAt:     string | null
  updatedAt:     string | null
  deletedAt:     string | null
}

export type NewSupplier = Omit<SupplierRecord, "id" | "createdAt" | "updatedAt" | "deletedAt">
export type UpdateSupplier = Partial<Omit<NewSupplier, "tenantId">>

export interface SupplierOption {
  id:            number
  label:         string
  code:          string | null
  contactPerson: string | null
  email:         string | null
  taxId:         string | null
  phone:         string | null
  address:       string | null
}
