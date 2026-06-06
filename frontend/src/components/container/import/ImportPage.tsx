import { useEffect, useMemo } from "react"
import Box from "@mui/material/Box"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import Stepper from "@mui/material/Stepper"

import { useSetPageHeader } from "@/components/context/PageHeaderContext"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_STEPS } from "@/lib/constants/import"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

import ImportModeChip          from "./ImportModeChip"
import ImportStepMapping       from "./generic/ImportStepMapping"
import ImportStepPreview       from "./generic/ImportStepPreview"
import ImportStepMapPreview    from "./supplierCatalog/ImportStepMapPreview"
import ImportStepMatchTemplate from "./supplierCatalog/ImportStepMatchTemplate"
import ImportStepResult        from "./supplierCatalog/ImportStepResult"
import ImportStepSummary       from "./supplierCatalog/ImportStepSummary"
import ImportStepUpload        from "./ImportStepUpload"

export default function ImportPage() {
  const { step, mode, reset } = useImportWizardStore()

  const headerConfig = useMemo(() => {
    const isSupplier = mode === "supplier_catalog"
    return {
      title:       "Import data",
      titleSuffix: isSupplier ? <ImportModeChip /> : undefined,
      subtitle:    isSupplier
        ? "Upload a supplier price list — Flowmerce detects the supplier, picks the right sheet, and maps columns for you."
        : "Upload Excel to import Products, Customers, or Suppliers",
      breadcrumbs: [{ label: "DATA" }, { label: "Import Data" }],
    }
  }, [mode])

  useSetPageHeader(headerConfig, [mode])

  useEffect(() => () => reset(), [reset])

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
      <Box
        sx={{
          mb:           3,
          p:            2,
          bgcolor:      COLORS.white,
          border:       `1px solid ${COLORS.border}`,
          borderRadius: 2,
        }}
      >
        <Stepper activeStep={step} alternativeLabel>
          {IMPORT_STEPS.map((label, idx) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    fontSize:   "0.85rem",
                    fontWeight: idx === step ? 700 : 500,
                    color:      idx === step ? `${COLORS.textLabelBlack} !important` : COLORS.subText,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {step === 0 && <ImportStepUpload />}
      {step === 1 && (mode === "supplier_catalog" ? <ImportStepMatchTemplate /> : <ImportStepMapping />)}
      {step === 2 && (mode === "supplier_catalog" ? <ImportStepMapPreview /> : <ImportStepPreview />)}
      {step === 3 && (mode === "supplier_catalog" ? <ImportStepSummary />    : <ImportStepPreview />)}
      {step === 4 && (mode === "supplier_catalog" ? <ImportStepResult />     : <ImportStepPreview />)}
    </Box>
  )
}
