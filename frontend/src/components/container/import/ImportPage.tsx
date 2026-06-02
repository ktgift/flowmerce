import { useEffect } from "react"
import Box from "@mui/material/Box"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import Stepper from "@mui/material/Stepper"

import { useSetPageHeader } from "@/components/context/PageHeaderContext"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_STEPS } from "@/lib/constants/import"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

import ImportStepUpload  from "./ImportStepUpload"
import ImportStepMapping from "./ImportStepMapping"
import ImportStepPreview from "./ImportStepPreview"

export default function ImportPage() {
  const { step, reset } = useImportWizardStore()

  useSetPageHeader(
    {
      title:       "Import Data",
      subtitle:    "Upload Excel to import Products, Customers, or Suppliers",
      breadcrumbs: [{ label: "DATA" }, { label: "Import Data" }],
    },
    [],
  )

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
                {`${idx + 1}. ${label}`}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {step === 0 && <ImportStepUpload />}
      {step === 1 && <ImportStepMapping />}
      {step === 2 && <ImportStepPreview />}
    </Box>
  )
}
