import type { ImportTargetTable } from "shared"

export type { ImportTargetTable }

export interface ImportMatch {
  header:   string
  field:    string | null
  score:    number
  isMapped: boolean
}

export interface SuggestResponse {
  sheets:           string[]
  headers:          string[]
  matches:          ImportMatch[]
  suggestedMapping: Record<string, string>
  matchedTemplate:  { id: number; name: string } | null
  rowCount:         number
  previewRows:      Record<string, string>[]
}

export interface ExecuteResponse {
  totalRows:   number
  createdRows: number
  updatedRows: number
  skippedRows: number
  errors:      string[]
  dryRun:      boolean
}

export interface ImportTemplate {
  id:            number
  name:          string
  targetTable:   string
  columnMapping: Record<string, string>
  createdAt:     string
}

export interface SaveTemplateInput {
  name:          string
  targetTable:   string
  columnMapping: Record<string, string>
}

export interface ExecuteImportInput {
  file:          File
  targetTable:   string
  columnMapping: Record<string, string>
  sheetName?:    string
  upsertKey?:    string
  dryRun?:       boolean
}
