import { useMemo, useState } from "react"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

import { IMPORT_SYSTEM_FIELDS } from "shared"
import { type AppSelectOption } from "@/components/common/AppSelect"
import { useExecuteImport } from "@/lib/api/import.api"
import { useSupplierOptions } from "@/lib/api/supplier.api"
import { COLORS } from "@/lib/constants/colors"
import {
  IMPORT_FIELD_LABELS,
  IMPORT_IGNORE_VALUE,
  IMPORT_SUPPLIER_CATALOG_TARGET,
} from "@/lib/constants/import"
import { useSnackbar } from "@/lib/hook/useSnackbar"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

import ImportStepFooter from "../ImportStepFooter"
import ImportContextHeader from "./ImportContextHeader"
import ImportMapColumnsCard from "./ImportMapColumnsCard"
import ImportPreviewTable from "./ImportPreviewTable"
import ImportUpsertSaveCard from "./ImportUpsertSaveCard"

type View = "map" | "preview"

export default function ImportStepMapPreview() {
  const {
    file,
    suggestion,
    sheetName,
    supplierId,
    supplierNewName,
    columnMapping,
    upsertKey,
    saveTemplate,
    templateName,
    executeResult,
    setColumn,
    setUpsertKey,
    setSaveTemplate,
    setTemplateName,
    setStep,
    setExecuteResult,
  } = useImportWizardStore()

  const snackbar = useSnackbar()
  const [view, setView] = useState<View>("map")

  const { data: suppliers = [] } = useSupplierOptions()

  const { mutate: execute, isPending: isExecuting } = useExecuteImport({
    onSuccess: (data) => {
      setExecuteResult(data)
      setView("preview")
    },
    onError: (err) => snackbar.error(err.message ?? "Failed to preview import"),
  })

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId) ?? null,
    [suppliers, supplierId],
  )

  const supplierDisplay = selectedSupplier?.label ?? supplierNewName ?? null
  const targetTable = IMPORT_SUPPLIER_CATALOG_TARGET

  const sampleByHeader = useMemo(() => {
    const first = suggestion?.previewRows[0] ?? {}
    return first as Record<string, string>
  }, [suggestion])

  const upsertOptions: AppSelectOption[] = useMemo(() => {
    const mapped = Array.from(
      new Set(Object.values(columnMapping).filter((v) => v && v !== IMPORT_IGNORE_VALUE)),
    )
    const labels = IMPORT_FIELD_LABELS[targetTable] ?? {}
    const source = mapped.length > 0 ? mapped : IMPORT_SYSTEM_FIELDS[targetTable]
    return source.map((f) => ({ value: f, label: `${f} — ${labels[f] ?? f}` }))
  }, [columnMapping, targetTable])

  if (!file || !suggestion) return null

  const headers     = suggestion.headers
  const mappedCount = headers.filter(
    (h) => (columnMapping[h] ?? "") !== IMPORT_IGNORE_VALUE,
  ).length
  const hasMapping  = mappedCount > 0

  function handlePreview() {
    if (!file) return
    execute({
      file,
      targetTable,
      columnMapping,
      sheetName,
      upsertKey,
      dryRun: true,
    })
  }

  function handleReview() {
    setStep(3)
  }

  function handleBack() {
    if (view === "preview") setView("map")
    else setStep(1)
  }

  const previewSummary = executeResult
    ? `${executeResult.totalRows - executeResult.skippedRows} rows ready · ${executeResult.skippedRows} skipped`
    : undefined

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ImportContextHeader
        supplierName={supplierDisplay}
        sheetName={sheetName}
        rowCount={suggestion.rowCount}
      />

      {view === "map" && (
        <>
          <ImportMapColumnsCard
            targetTable={targetTable}
            headers={headers}
            sampleByHeader={sampleByHeader}
            columnMapping={columnMapping}
            onChange={setColumn}
          />
          <ImportUpsertSaveCard
            upsertKey={upsertKey}
            upsertOptions={upsertOptions}
            onUpsertChange={setUpsertKey}
            saveTemplate={saveTemplate}
            templateName={templateName}
            onToggleSave={setSaveTemplate}
            onTemplateName={setTemplateName}
          />
          {isExecuting && (
            <Box
              sx={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            1.5,
                py:             1.5,
              }}
            >
              <CircularProgress size={18} />
              <Typography sx={{ fontSize: "0.875rem", color: COLORS.subText }}>
                Validating mapping...
              </Typography>
            </Box>
          )}
        </>
      )}

      {view === "preview" && (
        <ImportPreviewTable
          targetTable={targetTable}
          columnMapping={columnMapping}
          previewRows={suggestion.previewRows}
          totalRowCount={suggestion.rowCount}
        />
      )}

      <ImportStepFooter
        onBack={handleBack}
        backLabel={view === "preview" ? "Back to map" : "Back to match"}
        onContinue={view === "preview" ? handleReview : handlePreview}
        continueLabel={view === "preview" ? "Review import" : "Preview rows"}
        disabled={view === "map" ? !hasMapping || isExecuting : false}
        hint={view === "preview" ? previewSummary : undefined}
      />
    </Box>
  )
}
