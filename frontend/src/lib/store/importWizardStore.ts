import { create } from "zustand"

import type {
  ExecuteResponse,
  ImportTargetTable,
  SuggestResponse,
} from "@/lib/@types/import"

export type ImportStep = 0 | 1 | 2

interface ImportWizardState {
  step:           ImportStep
  file:           File | null
  targetTable:    ImportTargetTable
  suggestion:     SuggestResponse | null
  columnMapping:  Record<string, string>
  sheetName:      string | undefined
  upsertKey:      string
  executeResult:  ExecuteResponse | null

  setStep:           (step: ImportStep) => void
  setFile:           (file: File | null) => void
  setTargetTable:    (table: ImportTargetTable) => void
  setMapping:        (mapping: Record<string, string>) => void
  setColumn:         (header: string, field: string) => void
  setUpsertKey:      (key: string) => void
  applySuggestion:   (suggestion: SuggestResponse) => void
  applySheetChange:  (sheetName: string, next: SuggestResponse) => void
  setExecuteResult:  (result: ExecuteResponse) => void
  reset:             () => void
}

const DEFAULT_UPSERT_KEY = "code"

const INITIAL: Pick<
  ImportWizardState,
  "step" | "file" | "targetTable" | "suggestion" | "columnMapping" | "sheetName" | "upsertKey" | "executeResult"
> = {
  step:          0,
  file:          null,
  targetTable:   "trader_products",
  suggestion:    null,
  columnMapping: {},
  sheetName:     undefined,
  upsertKey:     DEFAULT_UPSERT_KEY,
  executeResult: null,
}

export const useImportWizardStore = create<ImportWizardState>((set) => ({
  ...INITIAL,

  setStep:        (step) => set({ step }),
  setFile:        (file) => set({ file }),
  setTargetTable: (targetTable) => set({ targetTable }),
  setMapping:     (columnMapping) => set({ columnMapping }),
  setColumn:      (header, field) =>
    set((s) => ({ columnMapping: { ...s.columnMapping, [header]: field } })),
  setUpsertKey:   (upsertKey) => set({ upsertKey }),

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

  setExecuteResult: (executeResult) => set({ executeResult, step: 2 }),

  reset: () => set({ ...INITIAL }),
}))
