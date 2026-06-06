import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import ButtonBase from "@mui/material/ButtonBase"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"

import Card from "@/components/common/Card"
import { useSupplierOptions } from "@/lib/api/supplier.api"
import { COLORS } from "@/lib/constants/colors"
import { ROUTES } from "@/lib/constants/routes"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

import ImportResultCard from "./ImportResultCard"

export default function ImportStepResult() {
  const navigate = useNavigate()
  const {
    file,
    suggestion,
    supplierId,
    supplierNewName,
    saveTemplate,
    templateName,
    executeResult,
    reset,
  } = useImportWizardStore()

  const { data: suppliers = [] } = useSupplierOptions()

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId) ?? null,
    [suppliers, supplierId],
  )
  const supplierDisplay = selectedSupplier?.label ?? supplierNewName ?? null

  if (!file || !suggestion || !executeResult) return null

  const matchedTemplateName =
    suggestion.matchedTemplate?.name ?? (saveTemplate ? templateName.trim() || null : null)

  const skipped = executeResult.skippedRows
  const errorPreview = executeResult.errors.slice(0, 1).join(" ")

  function handleImportAnother() {
    reset()
  }

  function handleViewProducts() {
    navigate(ROUTES.products)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 720, mx: "auto", width: "100%" }}>
      <ImportResultCard
        result={executeResult}
        supplierName={supplierDisplay}
        templateName={matchedTemplateName}
        fileName={file.name}
      />

      <Box
        sx={{
          display:        "flex",
          flexDirection:  { xs: "column", sm: "row" },
          alignItems:     "center",
          justifyContent: "center",
          gap:            1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleImportAnother}
          startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
        >
          Import another
        </Button>
        <Button
          variant="contained"
          onClick={handleViewProducts}
          startIcon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
        >
          View products
        </Button>
      </Box>

      {skipped > 0 && (
        <Card
          sx={{
            display:     "flex",
            alignItems:  "center",
            gap:         1.5,
            px:          2,
            py:          1.5,
            bgcolor:     COLORS.orangeLight,
            borderColor: COLORS.orangeLight,
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 20, color: COLORS.orangeDark, flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.85rem", color: COLORS.orangeDark, fontWeight: 600 }}>
              {skipped.toLocaleString()} {skipped === 1 ? "row was" : "rows were"} skipped
              {errorPreview ? ` (${errorPreview.toLowerCase()})` : ""}.
            </Typography>
          </Box>
          {executeResult.errors.length > 0 && (
            <ButtonBase
              sx={{
                fontSize:     "0.82rem",
                fontWeight:   700,
                color:        COLORS.primary,
                px:           0.75,
                py:           0.5,
                borderRadius: 1,
                flexShrink:   0,
                "&:hover":    { textDecoration: "underline" },
              }}
            >
              Download report
            </ButtonBase>
          )}
        </Card>
      )}
    </Box>
  )
}
