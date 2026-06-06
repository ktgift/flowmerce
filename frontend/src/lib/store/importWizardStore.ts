import { create } from "zustand"

import type {
  ExecuteResponse,
  ImportMode,
  ImportTargetTable,
  SuggestResponse,
} from "@/lib/@types/import"

export type ImportStep = 0 | 1 | 2 | 3 | 4

interface ImportWizardState {
  step:           ImportStep
  mode:           ImportMode
  file:           File | null
  targetTable:    ImportTargetTable
  supplierId:     number | null
  supplierNewName: string | null
  suggestion:     SuggestResponse | null
  columnMapping:  Record<string, string>
  sheetName:      string | undefined
  upsertKey:      string
  saveTemplate:   boolean
  templateName:   string
  executeResult:  ExecuteResponse | null

  setStep:            (step: ImportStep) => void
  setMode:            (mode: ImportMode) => void
  setFile:            (file: File | null) => void
  setTargetTable:     (table: ImportTargetTable) => void
  setSupplierId:      (id: number | null) => void
  setSupplierNewName: (name: string | null) => void
  setSheetName:       (name: string | undefined) => void
  setMapping:         (mapping: Record<string, string>) => void
  setColumn:          (header: string, field: string) => void
  setUpsertKey:       (key: string) => void
  setSaveTemplate:    (flag: boolean) => void
  setTemplateName:    (name: string) => void
  applySuggestion:    (suggestion: SuggestResponse) => void
  applySheetChange:   (sheetName: string, next: SuggestResponse) => void
  setExecuteResult:   (result: ExecuteResponse) => void
  reset:              () => void
}

const DEFAULT_UPSERT_KEY = "code"

const INITIAL: Pick<
  ImportWizardState,
  | "step"
  | "mode"
  | "file"
  | "targetTable"
  | "supplierId"
  | "supplierNewName"
  | "suggestion"
  | "columnMapping"
  | "sheetName"
  | "upsertKey"
  | "saveTemplate"
  | "templateName"
  | "executeResult"
> = {
  step:            0,
  mode:            "generic",
  file:            null,
  targetTable:     "trader_products",
  supplierId:      null,
  supplierNewName: null,
  suggestion:      null,
  columnMapping:   {},
  sheetName:       undefined,
  upsertKey:       DEFAULT_UPSERT_KEY,
  saveTemplate:    false,
  templateName:    "",
  executeResult:   null,
}

export const useImportWizardStore = create<ImportWizardState>((set) => ({
  ...INITIAL,

  setStep:            (step) => set({ step }),
  setMode:            (mode) =>
    set({
      mode,
      step:            0,
      file:            null,
      supplierId:      null,
      supplierNewName: null,
      suggestion:      null,
      columnMapping:   {},
      sheetName:       undefined,
    }),
  setFile:            (file) => set({ file }),
  setTargetTable:     (targetTable) => set({ targetTable }),
  setSupplierId:      (supplierId) => set({ supplierId, supplierNewName: null }),
  setSupplierNewName: (supplierNewName) => set({ supplierNewName, supplierId: null }),
  setSheetName:       (sheetName) => set({ sheetName }),
  setMapping:         (columnMapping) => set({ columnMapping }),
  setColumn:          (header, field) =>
    set((s) => ({ columnMapping: { ...s.columnMapping, [header]: field } })),
  setUpsertKey:       (upsertKey) => set({ upsertKey }),
  setSaveTemplate:    (saveTemplate) => set({ saveTemplate }),
  setTemplateName:    (templateName) => set({ templateName }),

  applySuggestion: (suggestion) =>
    set({
      suggestion,
      columnMapping: suggestion.suggestedMapping,
      sheetName:     suggestion.sheets[0],
      step:          1,
    }),

  applySheetChange: (sheetName, next) =>
    set({
      sheetName,
      suggestion:    next,
      columnMapping: next.suggestedMapping,
    }),

  setExecuteResult: (executeResult) => set({ executeResult }),

  reset: () => set({ ...INITIAL }),
}))
