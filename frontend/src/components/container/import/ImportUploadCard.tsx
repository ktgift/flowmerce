import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined"

import AppSelect from "@/components/common/AppSelect"
import Card from "@/components/common/Card"
import FileDropZone from "@/components/common/FileDropZone"
import { COLORS } from "@/lib/constants/colors"
import {
  IMPORT_FILE_ACCEPT,
  IMPORT_MAX_FILE_SIZE_MB,
  IMPORT_TARGET_OPTIONS,
} from "@/lib/constants/import"
import type { ImportTargetTable } from "@/lib/@types/import"

interface ImportUploadCardProps {
  file:           File | null
  targetTable:    ImportTargetTable
  onFileChange:   (file: File | null) => void
  onTargetChange: (table: ImportTargetTable) => void
  onTrySample?:   () => void
}

export default function ImportUploadCard({
  file,
  targetTable,
  onFileChange,
  onTargetChange,
}: ImportUploadCardProps) {
  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display:        "flex",
          alignItems:     { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection:  { xs: "column", sm: "row" },
          gap:            1.5,
          mb:             2,
        }}
      >
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
          Upload File
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.subText }}>
            Import to:
          </Typography>
          <AppSelect
            value={targetTable}
            onChange={(v) => onTargetChange(v as ImportTargetTable)}
            options={IMPORT_TARGET_OPTIONS}
            width={180}
          />
        </Box>
      </Box>

      <FileDropZone
        files={file ? [file] : []}
        onChange={(files) => onFileChange(files[0] ?? null)}
        accept={IMPORT_FILE_ACCEPT}
        multiple={false}
        showSelectButton
        title="Drop Excel here or click to select a file"
        hint={`Supports .xlsx, .xls — up to ${IMPORT_MAX_FILE_SIZE_MB} MB`}
        icon={<CloudUploadOutlinedIcon sx={{ fontSize: 30, color: COLORS.primary }} />}
        py={{ xs: 4, md: 6 }}
      />
    </Card>
  )
}
