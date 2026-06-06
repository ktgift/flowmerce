import { useRef } from "react"
import Box from "@mui/material/Box"
import ButtonBase from "@mui/material/ButtonBase"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined"

import Card           from "@/components/common/Card"
import FileDropZone   from "@/components/common/FileDropZone"
import { COLORS }     from "@/lib/constants/colors"
import {
  IMPORT_FILE_ACCEPT,
  IMPORT_MAX_FILE_SIZE_MB,
  IMPORT_SAMPLE_FILENAME,
  IMPORT_SUPPLIER_CATALOG_TARGET,
} from "@/lib/constants/import"
import { useSuggestImport } from "@/lib/api/import.api"
import { useSnackbar }      from "@/lib/hook/useSnackbar"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

export default function ImportSupplierCatalogStep() {
  const { file, setFile, applySuggestion } = useImportWizardStore()

  const snackbar       = useSnackbar()
  const lastRequestKey = useRef<string | null>(null)

  const { mutate: suggest, isPending } = useSuggestImport({
    onSuccess: (data) => applySuggestion(data),
    onError:   (err)  => {
      lastRequestKey.current = null
      snackbar.error(err.message ?? "Failed to analyze file")
    },
  })

  function runSuggest(nextFile: File) {
    const key = `${nextFile.name}|${nextFile.size}|${nextFile.lastModified}|${IMPORT_SUPPLIER_CATALOG_TARGET}`
    if (lastRequestKey.current === key) return
    lastRequestKey.current = key
    suggest({ file: nextFile, targetTable: IMPORT_SUPPLIER_CATALOG_TARGET })
  }

  function handleFileChange(next: File | null) {
    setFile(next)
    if (next) runSuggest(next)
    else lastRequestKey.current = null
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <FileDropZone
          files={file ? [file] : []}
          onChange={(files) => handleFileChange(files[0] ?? null)}
          accept={IMPORT_FILE_ACCEPT}
          multiple={false}
          showSelectButton
          selectButtonLabel="Choose file"
          title="Drop a supplier file, or click to browse"
          hint={`We auto-detect the supplier, sheet & columns · .xlsx, .xls, .csv up to ${IMPORT_MAX_FILE_SIZE_MB} MB`}
          icon={<CloudUploadOutlinedIcon sx={{ fontSize: 28, color: COLORS.primary }} />}
          py={{ xs: 5, md: 7 }}
        />

        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "center" }}>
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.subText }}>
            or try a sample —{" "}
            <ButtonBase
              sx={{
                color:          COLORS.primary,
                fontWeight:     700,
                fontSize:       "0.85rem",
                verticalAlign:  "baseline",
                "&:hover":      { textDecoration: "underline" },
              }}
            >
              {IMPORT_SAMPLE_FILENAME}
            </ButtonBase>
          </Typography>
        </Box>
      </Card>

      {isPending && (
        <Box
          sx={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            1.5,
            py:             1,
          }}
        >
          <CircularProgress size={18} />
          <Typography sx={{ fontSize: "0.875rem", color: COLORS.subText }}>
            Analyzing file...
          </Typography>
        </Box>
      )}
    </Box>
  )
}
