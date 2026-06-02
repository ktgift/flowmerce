import { useRef } from "react"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

import { useSuggestImport } from "@/lib/api/import.api"
import { COLORS } from "@/lib/constants/colors"
import { useSnackbar } from "@/lib/hook/useSnackbar"
import { useImportWizardStore } from "@/lib/store/importWizardStore"
import type { ImportTargetTable } from "@/lib/@types/import"

import ImportHistoryTable from "./ImportHistoryTable"
import ImportSavedTemplatesCard from "./ImportSavedTemplatesCard"
import ImportTipsCard from "./ImportTipsCard"
import ImportUploadCard from "./ImportUploadCard"

export default function ImportStepUpload() {
  const {
    file,
    targetTable,
    setFile,
    setTargetTable,
    applySuggestion,
  } = useImportWizardStore()

  const snackbar = useSnackbar()
  const lastRequestKey = useRef<string | null>(null)

  const { mutate: suggest, isPending } = useSuggestImport({
    onSuccess: (data) => applySuggestion(data),
    onError:   (err)  => {
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
      <Box
        sx={{
          display:             "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap:                 3,
          alignItems:          "start",
        }}
      >
        <ImportUploadCard
          file={file}
          targetTable={targetTable}
          onFileChange={handleFileChange}
          onTargetChange={handleTargetChange}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ImportTipsCard />
          <ImportSavedTemplatesCard />
        </Box>
      </Box>

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

      <ImportHistoryTable />
    </Box>
  )
}
