import type { TargetTable } from "./columnMatcher"

export interface RowValidationError {
  row:     number
  field:   string
  message: string
}

const REQUIRED_FIELDS: Record<TargetTable, string[]> = {
  trader_products: ["name"],
  customers:       ["name"],
  suppliers:       ["name"],
}

export function validateRow(
  mapped: Record<string, string>,
  targetTable: TargetTable,
  rowNumber: number,
): RowValidationError[] {
  const errors: RowValidationError[] = []
  for (const field of REQUIRED_FIELDS[targetTable] ?? []) {
    if (!mapped[field]) {
      errors.push({ row: rowNumber, field, message: `ต้องระบุ ${field}` })
    }
  }
  return errors
}
