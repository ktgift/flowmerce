import { useRef } from "react"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

import { useSuggestImport } from "@/lib/api/import.api"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_MODE_HINTS } from "@/lib/constants/import"
import { useSnackbar } from "@/lib/hook/useSnackbar"
import { useImportWizardStore } from "@/lib/store/importWizardStore"
import type { ImportTargetTable } from "@/lib/@types/import"

import ImportHistoryTable        from "./ImportHistoryTable"
import ImportModeToggle          from "./ImportModeToggle"
import ImportSavedTemplatesCard  from "./ImportSavedTemplatesCard"
import ImportTipsCard            from "./ImportTipsCard"
import ImportUploadCard          from "./generic/ImportUploadCard"
import ImportSupplierUploadStep  from "./supplierCatalog/ImportStepUpload"

export default function ImportStepUpload() {
  const {
    mode,
    file,
    targetTable,
    setMode,
    setFile,
    setTargetTable,
    applySuggestion,
  } = useImportWizardStore()

  const snackbar = useSnackbar()
  const lastRequestKey = useRef<string | null>(null)

  const { mutate: suggest, isPending } = useSuggestImport({
    onSuccess: (data) => applySuggestion(data),
    onError: (err) => {
      lastRequestKey.current = null
      snackbar.error(err.message ?? "Failed to analyze file")
    },
  })

  function runSuggest(nextFile: File, nextTable: ImportTargetTable) {
    const key = `${nextFile.name}|${nextFile.size}|${nextFile.lastModified}|${nextTable}`
    if (lastRequestKey.current === key) return
    lastRequestKey.current = key
    suggest({ file: nextFile, targetTable: nextTable })
  }

  function handleFileChange(next: File | null) {
    setFile(next)
    if (next) runSuggest(next, targetTable)
    else lastRequestKey.current = null
  }

  function handleTargetChange(next: ImportTargetTable) {
    setTargetTable(next)
    if (file) runSuggest(file, next)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <ImportModeToggle
        value={mode}
        onChange={setMode}
        hint={IMPORT_MODE_HINTS[mode]}
      />

      <Box
        sx={{
          display:             "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(0, 1fr)" },
          gap:                 3,
          alignItems:          "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          {mode === "supplier_catalog" ? (
            <ImportSupplierUploadStep />
          ) : (
            <>
              <ImportUploadCard
                file={file}
                targetTable={targetTable}
                onFileChange={handleFileChange}
                onTargetChange={handleTargetChange}
              />

              {isPending && (
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
                    Analyzing file...
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ImportTipsCard />
          <ImportSavedTemplatesCard />
        </Box>
      </Box>

      <ImportHistoryTable />
    </Box>
  )
}
