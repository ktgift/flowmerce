import type { PoDetail, Receipt, ReceiveItem } from "@/lib/@types/po"

// ─── Cost Breakdown ───────────────────────────────────────────────────────────

export interface ItemCostBreakdown {
  cifUsd: number
  cifThb: number
  taxThb: number
  landed: number
}

export interface ItemCostInputs {
  /** exWorkPrice + freightCost (form) or cifPrice (detail view) */
  cifUsdPerUnit:        number
  /** percentage, e.g. 7 for 7% */
  taxRate:              number
  clearingCost:         number
  warehouseCostPercent: number
  exchangeRate:         number
}

export function calcItemCost(inputs: ItemCostInputs): ItemCostBreakdown {
  const { cifUsdPerUnit, taxRate, clearingCost, warehouseCostPercent, exchangeRate } = inputs
  const cifThb = cifUsdPerUnit * exchangeRate
  const taxThb = cifThb * (taxRate / 100)
  const landed = cifThb + taxThb + clearingCost + cifThb * (warehouseCostPercent / 100)
  return { cifUsd: cifUsdPerUnit, cifThb, taxThb, landed }
}

// ─── Received Quantity Helpers ────────────────────────────────────────────────

export function buildReceivedMap(receipts: Receipt[]): Record<number, number> {
  const map: Record<number, number> = {}
  for (const receipt of receipts) {
    for (const ri of receipt.items ?? []) {
      map[ri.poItemId] = (map[ri.poItemId] ?? 0) + ri.quantityReceived
    }
  }
  return map
}

export function buildReceiveItems(po: PoDetail): ReceiveItem[] {
  const receivedMap = buildReceivedMap(po.receipts)
  return po.items
    .map((item) => ({ ...item, remainingQty: item.quantity - (receivedMap[item.id] ?? 0) }))
    .filter((item) => item.remainingQty > 0)
}
