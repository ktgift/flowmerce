import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import { useSupplierOptions } from "@/lib/api/supplier.api"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

import ImportSavedTemplatesCard  from "../ImportSavedTemplatesCard"
import ImportTipsCard            from "../ImportTipsCard"
import ImportMatchTemplateFooter from "./ImportMatchTemplateFooter"
import ImportMatchedChip         from "./ImportMatchedChip"
import ImportSectionWithCheck    from "./ImportSectionWithCheck"
import ImportSheetPickerList     from "./ImportSheetPickerList"
import ImportSupplierDetectCard  from "./ImportSupplierDetectCard"
import ImportSupplierFileBar     from "./ImportSupplierFileBar"

export default function ImportStepMatchTemplate() {
  const {
    file,
    suggestion,
    sheetName,
    supplierId,
    supplierNewName,
    setFile,
    setStep,
    setSupplierId,
    setSupplierNewName,
    applySheetChange,
  } = useImportWizardStore()

  const { data: suppliers = [] } = useSupplierOptions()

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId) ?? null,
    [suppliers, supplierId],
  )

  if (!file || !suggestion) return null

  const supplierDone = supplierId !== null || (supplierNewName?.trim().length ?? 0) > 0
  const sheetDone    = Boolean(sheetName)
  const canContinue  = supplierDone && sheetDone

  const supplierDisplay = selectedSupplier?.label ?? supplierNewName ?? null

  function handleReplace() {
    setFile(null)
    setStep(0)
  }

  function handleSheetChange(name: string) {
    if (!suggestion) return
    applySheetChange(name, suggestion)
  }

  function handleContinue() {
    if (!canContinue) return
    setStep(2)
  }

  return (
    <Box
      sx={{
        display:             "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(0, 1fr)" },
        gap:                 3,
        alignItems:          "start",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <ImportSupplierFileBar
          file={file}
          sheetCount={suggestion.sheets.length}
          onReplace={handleReplace}
        />

        <Card sx={{ p: { xs: 2, md: 2.5 } }}>
          <ImportSectionWithCheck
            title="Supplier"
            titleChip={<ImportMatchedChip />}
            hint={
              <>
                <Typography component="span" sx={{ color: COLORS.text }}>
                  Looks like a <strong>"{supplierDisplay ?? "this"}"</strong> file.
                </Typography>{" "}
                Every row will be linked to this supplier — no manual column needed.
              </>
            }
            done={supplierDone}
          >
            <ImportSupplierDetectCard
              filename={file.name}
              supplierId={supplierId}
              supplierNewName={supplierNewName}
              rowCount={suggestion.rowCount}
              onPickExisting={setSupplierId}
              onPickNew={setSupplierNewName}
            />
          </ImportSectionWithCheck>

          <ImportSectionWithCheck
            title="Sheet to import"
            hint={`This workbook has ${suggestion.sheets.length} sheet${suggestion.sheets.length === 1 ? "" : "s"} — we picked the best match. Choose the one holding the price list.`}
            done={sheetDone}
            isLast
          >
            <ImportSheetPickerList
              sheets={suggestion.sheets}
              activeSheet={sheetName}
              bestSheet={suggestion.sheets[0]}
              activeRowCount={suggestion.rowCount}
              activeColCount={suggestion.headers.length}
              onChange={handleSheetChange}
            />
          </ImportSectionWithCheck>
        </Card>

        <ImportMatchTemplateFooter
          rowCount={suggestion.rowCount}
          sheetName={sheetName}
          supplierName={supplierDisplay}
          onContinue={handleContinue}
          disabled={!canContinue}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ImportTipsCard />
        <ImportSavedTemplatesCard />
      </Box>
    </Box>
  )
}
