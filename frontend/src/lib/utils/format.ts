import dayjs from "dayjs"

export function toIsoDate(raw: string | null | undefined): string {
  if (!raw) return ""
  return dayjs(raw).format("YYYY-MM-DD")
}

export function formatMoney(amount: number | null | undefined, currency = "THB"): string {
  if (amount == null) return "—"
  const symbol = currency.toUpperCase() === "USD" ? "$" : "฿"
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—"
  return dayjs(date).format("DD MMM YYYY")
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "—"
  // SQLite datetime('now') stores UTC without timezone indicator — append Z before parsing
  const utcStr = date.endsWith("Z") ? date : date.replace(" ", "T") + "Z"
  return dayjs(utcStr).format("DD MMM YYYY HH:mm")
}

export function formatMoneyCompact(amount: number): string {
  if (amount >= 1_000_000) return `฿${parseFloat((amount / 1_000_000).toFixed(2))}M`
  if (amount >= 1_000)     return `฿${Math.round(amount / 1_000)}K`
  return `฿${Math.round(amount).toLocaleString()}`
}

export function formatNumber(
  n: number | null | undefined,
  decimals = 2,
): string {
  if (n == null) return "—"
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}