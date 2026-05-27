export interface SupplierListItem {
  id:   number
  name: string
}

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

export interface SupplierDetail {
  id:            number
  name:          string
  code:          string | null
  taxId:         string | null
  address:       string | null
  phone:         string | null
  email:         string | null
  contactPerson: string | null
  notes:         string | null
}
