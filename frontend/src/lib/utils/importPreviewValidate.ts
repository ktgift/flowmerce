import type { ImportTargetTable } from "shared"

import { IMPORT_FIELD_RULES } from "@/lib/constants/import"
import { formatNumber }       from "@/lib/utils/format"

export type PreviewCellIssue =
  | "empty_required"
  | "not_a_number"
  | "below_min"

export interface PreviewCellInfo {
  raw:     string
  display: string
  isEmpty: boolean
  align:   "left" | "right"
  issue?:  PreviewCellIssue
}

export function validatePreviewCell(
  rawValue:    string | undefined,
  systemField: string,
  targetTable: ImportTargetTable,
): PreviewCellInfo {
  const raw     = (rawValue ?? "").toString().trim()
  const isEmpty = raw === ""
  const rule    = IMPORT_FIELD_RULES[targetTable]?.[systemField]
  const align: "left" | "right" = rule?.numeric ? "right" : "left"

  if (!rule) {
    return {
      raw,
      display: isEmpty ? "—" : raw,
      isEmpty,
      align,
    }
  }

  if (isEmpty) {
    if (rule.required) {
      return {
        raw,
        display: "(empty)",
        isEmpty: true,
        align,
        issue:   "empty_required",
      }
    }
    return {
      raw,
      display: rule.numeric ? "0" : "—",
      isEmpty: true,
      align,
    }
  }

  if (rule.numeric) {
    const num = Number(raw.replace(/,/g, ""))
    if (Number.isNaN(num)) {
      return { raw, display: raw, isEmpty: false, align, issue: "not_a_number" }
    }
    const belowMin = rule.minValue !== undefined && num < rule.minValue
    return {
      raw,
      display: num < 0
        ? `−${formatNumber(Math.abs(num), 2)}`
        : formatNumber(num, num % 1 === 0 ? 0 : 2),
      isEmpty: false,
      align,
      issue:   belowMin ? "below_min" : undefined,
    }
  }

  return { raw, display: raw, isEmpty: false, align }
}

export interface PreviewRowValidation {
  cells:    Record<string, PreviewCellInfo>
  hasIssue: boolean
}

export function validatePreviewRow(
  row:           Record<string, string>,
  mappedColumns: { excel: string; field: string }[],
  targetTable:   ImportTargetTable,
): PreviewRowValidation {
  const cells: Record<string, PreviewCellInfo> = {}
  let hasIssue = false
  for (const { excel, field } of mappedColumns) {
    const cell = validatePreviewCell(row[excel], field, targetTable)
    cells[excel] = cell
    if (cell.issue) hasIssue = true
  }
  return { cells, hasIssue }
}
