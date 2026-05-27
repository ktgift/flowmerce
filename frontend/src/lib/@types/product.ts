export interface ProductListItem {
  id:            number
  name:          string
  sku:           string | null
  category:      string | null
  unit:          string | null
  stockQty:      number | null
  lastCostPrice: number | null
  margin:        number | null
}

export interface SelectedProduct {
  id:            number
  name:          string
  sku:           string | null
  unit:          string | null
  lastCostPrice: number | null
}
