import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import CloseIcon from "@mui/icons-material/Close"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_TARGET_OPTIONS } from "@/lib/constants/import"
import type { ImportTargetTable } from "@/lib/@types/import"

interface ImportFilePreviewBarProps {
  file:        File
  targetTable: ImportTargetTable
  onRemove?:   () => void
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImportFilePreviewBar({
  file,
  targetTable,
  onRemove,
}: ImportFilePreviewBarProps) {
  const targetLabel = IMPORT_TARGET_OPTIONS.find((o) => o.value === targetTable)?.label ?? targetTable

  return (
    <Card
      sx={{
        display:    "flex",
        alignItems: "center",
        gap:        1.5,
        px:         2,
        py:         1.5,
      }}
    >
      <Box
        sx={{
          width:          40,
          height:         40,
          flexShrink:     0,
          borderRadius:   1.5,
          bgcolor:        COLORS.greenLight,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <DescriptionOutlinedIcon sx={{ fontSize: 22, color: COLORS.greenDark }} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize:     "0.95rem",
            fontWeight:   700,
            color:        COLORS.textLabelBlack,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          {file.name}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText }}>
          {formatSize(file.size)} · Import to {targetLabel}
        </Typography>
      </Box>

      {onRemove && (
        <IconButton size="small" onClick={onRemove} sx={{ flexShrink: 0 }}>
          <CloseIcon sx={{ fontSize: 18, color: COLORS.neutral }} />
        </IconButton>
      )}
    </Card>
  )
}
