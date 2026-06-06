import { useMemo, useRef } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import ButtonBase from "@mui/material/ButtonBase"
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined"

import Card from "@/components/common/Card"
import { useExecuteImport, useSaveTemplate } from "@/lib/api/import.api"
import { useSupplierOptions } from "@/lib/api/supplier.api"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_SUPPLIER_CATALOG_TARGET } from "@/lib/constants/import"
import { useModal } from "@/lib/hook/useModal"
import { useSnackbar } from "@/lib/hook/useSnackbar"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

import ImportContextHeader from "./ImportContextHeader"
import ImportSkippedRowsModal from "./ImportSkippedRowsModal"
import ImportSummaryCard from "./ImportSummaryCard"

export default function ImportStepSummary() {
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
    setStep,
    setExecuteResult,
  } = useImportWizardStore()

  const snackbar     = useSnackbar()
  const { openModal } = useModal()
  const importedRef  = useRef(false)
  const { data: suppliers = [] } = useSupplierOptions()

  const { mutate: saveTpl } = useSaveTemplate({
    onError: (err) => snackbar.warning(err.message ?? "Failed to save template"),
  })

  const { mutate: execute, isPending: isImporting } = useExecuteImport({
    onSuccess: (data) => {
      setExecuteResult(data)
      if (saveTemplate && templateName.trim()) {
        saveTpl({
          name:          templateName.trim(),
          targetTable:   IMPORT_SUPPLIER_CATALOG_TARGET,
          columnMapping,
        })
      }
      setStep(4)
    },
    onError: (err) => snackbar.error(err.message ?? "Failed to import"),
  })

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId) ?? null,
    [suppliers, supplierId],
  )
  const supplierDisplay = selectedSupplier?.label ?? supplierNewName ?? null

  if (!file || !suggestion || !executeResult) return null

  const writeCount = executeResult.createdRows + executeResult.updatedRows
  const matchedTemplateName = suggestion.matchedTemplate?.name ?? (saveTemplate ? templateName.trim() : null)

  function handleImport() {
    if (!file || importedRef.current) return
    importedRef.current = true
    execute({
      file,
      targetTable: IMPORT_SUPPLIER_CATALOG_TARGET,
      columnMapping,
      sheetName,
      upsertKey,
      dryRun: false,
    })
  }

  function handleBack() {
    setStep(2)
  }

  function handleShowSkipped() {
    if (!executeResult || !suggestion) return
    openModal({
      title: "Skipped rows",
      width: 640,
      body:  (
        <ImportSkippedRowsModal
          totalSkipped={executeResult.skippedRows}
          errors={executeResult.errors}
          previewRows={suggestion.previewRows}
          columnMapping={columnMapping}
          targetTable={IMPORT_SUPPLIER_CATALOG_TARGET}
        />
      ),
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ImportContextHeader
        supplierName={supplierDisplay}
        sheetName={sheetName}
        rowCount={suggestion.rowCount}
      />

      <ImportSummaryCard
        result={executeResult}
        fileName={file.name}
        supplierName={supplierDisplay}
        sheetName={sheetName}
        rowCount={suggestion.rowCount}
        templateName={matchedTemplateName ?? null}
        upsertKey={upsertKey}
        onClickSkip={handleShowSkipped}
      />

      <Card
        sx={{
          display:        "flex",
          flexDirection:  { xs: "column", sm: "row" },
          alignItems:     { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap:            1.5,
          px:             2,
          py:             1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <ButtonBase
            onClick={handleBack}
            sx={{
              fontSize:     "0.85rem",
              fontWeight:   600,
              color:        COLORS.subText,
              px:           1,
              py:           0.5,
              borderRadius: 1,
              "&:hover":    { bgcolor: COLORS.pillBg, color: COLORS.text },
            }}
          >
            ← Back
          </ButtonBase>
          <Typography sx={{ fontSize: "0.82rem", color: COLORS.subText }}>
            <Box component="strong" sx={{ color: COLORS.text }}>
              {writeCount.toLocaleString()}
            </Box>{" "}
            rows will be written to Products
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="success"
          onClick={handleImport}
          disabled={isImporting}
          startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: "none",
            fontWeight:    700,
            px:            3,
          }}
        >
          {isImporting ? "Importing..." : "Import now"}
        </Button>
      </Card>
    </Box>
  )
}
