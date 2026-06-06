import { useMemo } from "react"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"

import { useExecuteImport } from "@/lib/api/import.api"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_IGNORE_VALUE } from "@/lib/constants/import"
import { useSnackbar } from "@/lib/hook/useSnackbar"
import { useImportWizardStore } from "@/lib/store/importWizardStore"
import { validatePreviewRow } from "@/lib/utils/importPreviewValidate"

import ImportPreviewDataCard from "./ImportPreviewDataCard"

export default function ImportStepPreview() {
  const {
    file,
    targetTable,
    columnMapping,
    sheetName,
    suggestion,
    executeResult,
    setStep,
    reset,
  } = useImportWizardStore()

  const snackbar = useSnackbar()

  const { mutate: execute, isPending } = useExecuteImport({
    onSuccess: () => {
      snackbar.success("Import completed")
      reset()
    },
    onError: (err) => snackbar.error(err.message ?? "Import failed"),
  })

  const mappedColumns = useMemo(() => {
    if (!suggestion) return []
    return suggestion.headers
      .filter(
        (h) => (columnMapping[h] ?? IMPORT_IGNORE_VALUE) !== IMPORT_IGNORE_VALUE,
      )
      .map((excel) => ({ excel, field: columnMapping[excel] }))
  }, [suggestion, columnMapping])

  const previewIssueCount = useMemo(() => {
    if (!suggestion) return 0
    return suggestion.previewRows.reduce((acc, row) => {
      const { hasIssue } = validatePreviewRow(row, mappedColumns, targetTable)
      return acc + (hasIssue ? 1 : 0)
    }, 0)
  }, [suggestion, mappedColumns, targetTable])

  if (!file || !suggestion || !executeResult) return null

  const totalRows  = executeResult.totalRows
  const issueCount = Math.max(executeResult.skippedRows, previewIssueCount)
  const validCount = Math.max(totalRows - issueCount, 0)

  function handleContinue() {
    if (!file) return
    execute({
      file,
      targetTable,
      columnMapping,
      sheetName,
      dryRun: false,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ImportPreviewDataCard
        headers={suggestion.headers}
        columnMapping={columnMapping}
        previewRows={suggestion.previewRows}
        targetTable={targetTable}
        totalRows={totalRows}
        validCount={validCount}
        issueCount={issueCount}
      />

      {executeResult.errors.length > 0 && (
        <Accordion variant="outlined" sx={{ borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              sx={{
                fontSize:   "0.875rem",
                fontWeight: 600,
                color:      COLORS.redDark,
              }}
            >
              {executeResult.errors.length} error
              {executeResult.errors.length === 1 ? "" : "s"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              component="ul"
              sx={{
                m:             0,
                pl:            2.5,
                display:       "flex",
                flexDirection: "column",
                gap:           0.5,
              }}
            >
              {executeResult.errors.map((err, idx) => (
                <Typography
                  component="li"
                  key={idx}
                  sx={{ fontSize: "0.75rem", color: COLORS.text }}
                >
                  {err}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <Box
        sx={{
          display:        "flex",
          justifyContent: "space-between",
          gap:            1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setStep(1)}
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={isPending}
          endIcon={<ChevronRightRoundedIcon />}
        >
          Continue
        </Button>
      </Box>
    </Box>
  )
}
