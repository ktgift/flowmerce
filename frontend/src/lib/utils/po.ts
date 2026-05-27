export interface PoExportData {
  supplierId?:    number | null
  supplierLabel?: string | null
  currency?:      string | null
  exchangeRate?:  number | null
  expectedDate?:  string | null
  paymentTerm?:   string | null
  deliveryTerm?:  string | null
  shippingMethod?: string | null
  items?: Array<{
    refId?:                number | null
    name?:                 string | null
    unit?:                 string | null
    quantity?:             number | null
    exWorkPrice?:          number | null
    freightCost?:          number | null
    taxRate?:              number | null
    clearingCost?:         number | null
    warehouseCostPercent?: number | null
  }>
}

export function getPoExportBlockers(data: PoExportData): string[] {
  const blockers: string[] = []

  if (!(data.supplierId || data.supplierLabel))  blockers.push("Supplier required")
  if (!data.currency)                            blockers.push("Currency required")
  if ((data.exchangeRate ?? 0) <= 0)             blockers.push("Exchange Rate must be > 0")
  if (!data.expectedDate)                        blockers.push("Expected Date required")
  if (!data.paymentTerm)                         blockers.push("Payment Term required")
  if (!data.deliveryTerm)                        blockers.push("Delivery Term required")
  if (!data.shippingMethod)                      blockers.push("Shipping Method required")

  const items = data.items ?? []
  if (items.length === 0) {
    blockers.push("At least 1 item required")
  } else {
    items.forEach((item, i) => {
      const missing: string[] = []
      if (!(item.refId || item.name))              missing.push("name")
      if (!item.unit)                              missing.push("unit")
      if ((item.quantity    ?? 0)  <= 0)           missing.push("quantity > 0")
      if ((item.exWorkPrice ?? 0)  <= 0)           missing.push("EXW price > 0")
      if ((item.freightCost ?? -1) <  0)           missing.push("freight cost")
      if ((item.taxRate             ?? -1) < 0)    missing.push("tax rate")
      if ((item.clearingCost        ?? -1) < 0)    missing.push("clearing cost")
      if ((item.warehouseCostPercent ?? -1) < 0)   missing.push("warehouse %")
      if (missing.length > 0) blockers.push(`Item ${i + 1}: ${missing.join(", ")}`)
    })
  }

  return blockers
}
