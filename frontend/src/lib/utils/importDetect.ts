import type { SupplierOption } from "@/lib/@types/supplier"

const NOISE_TOKENS = [
  "price",
  "list",
  "pricelist",
  "stock",
  "supply",
  "status",
  "with",
  "po",
  "so",
  "qty",
  "update",
  "revision",
  "rev",
  "report",
  "summary",
  "data",
  "import",
  "template",
  "copy",
  "final",
  "draft",
  "thai",
  "thailand",
  "th",
  "and",
  "others",
  "global",
]

const MONTHS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
  "jan","feb","mar","apr","jun","jul","aug","sep","sept","oct","nov","dec",
]

/**
 * Pull a supplier-name candidate out of an Excel filename.
 *
 * Strategy: strip extension, split on non-word chars, drop tokens that look
 * like noise (price/list/update/dates/numbers/months), keep the leading
 * meaningful word(s).
 */
export function detectSupplierNameFromFilename(filename: string): string | null {
  const stem = filename.replace(/\.[^./]+$/, "")
  const raw  = stem.split(/[^A-Za-z0-9&]+/).filter(Boolean)

  const meaningful = raw.filter((tok) => {
    const lower = tok.toLowerCase()
    if (NOISE_TOKENS.includes(lower)) return false
    if (MONTHS.includes(lower))       return false
    if (/^\d+$/.test(tok))            return false
    if (/^v\d+$/i.test(tok))          return false
    if (tok.length < 2)               return false
    return true
  })

  if (meaningful.length === 0) return null

  // Prefer the first 1-2 tokens — usually the supplier brand.
  const head = meaningful.slice(0, 2).join(" ")
  return head.charAt(0).toUpperCase() + head.slice(1)
}

interface MatchResult {
  supplier: SupplierOption
  score:    number
}

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2)
}

/**
 * Find the best supplier match for a guessed name.
 * Uses token overlap. Returns null when overlap is too weak.
 */
export function findSupplierMatch(
  guess:     string,
  suppliers: SupplierOption[],
): SupplierOption | null {
  if (!guess || suppliers.length === 0) return null
  const guessTokens = new Set(tokenize(guess))
  if (guessTokens.size === 0) return null

  const ranked: MatchResult[] = suppliers.map((sup) => {
    const labelTokens = tokenize(sup.label)
    const overlap     = labelTokens.filter((t) => guessTokens.has(t)).length
    const union       = new Set([...labelTokens, ...guessTokens]).size
    return { supplier: sup, score: union === 0 ? 0 : overlap / union }
  })

  ranked.sort((a, b) => b.score - a.score)
  const best = ranked[0]
  return best && best.score >= 0.34 ? best.supplier : null
}

const NOISE_SHEET_PATTERNS = [
  /^sheet\s*\d+$/i,
  /^definition/i,
  /^legend/i,
  /^notes?$/i,
  /^log$/i,
  /^activity/i,
  /^reference/i,
  /^dropdown/i,
  /^lookup/i,
  /^global\s*customer/i,
  /^shipping/i,
]

export function classifySheet(name: string): "noise" | "data" {
  return NOISE_SHEET_PATTERNS.some((re) => re.test(name)) ? "noise" : "data"
}
