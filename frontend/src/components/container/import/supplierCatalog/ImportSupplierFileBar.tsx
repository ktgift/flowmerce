import Box from "@mui/material/Box"
import ButtonBase from "@mui/material/ButtonBase"
import Typography from "@mui/material/Typography"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

interface ImportSupplierFileBarProps {
  file:       File
  sheetCount: number
  onReplace:  () => void
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImportSupplierFileBar({
  file,
  sheetCount,
  onReplace,
}: ImportSupplierFileBarProps) {
  return (
    <Card
      sx={{
        display:        "flex",
        alignItems:     "center",
        gap:            1.5,
        px:             { xs: 1.5, sm: 2 },
        py:             1.5,
        bgcolor:        COLORS.greenLight,
        borderColor:    COLORS.greenLight,
        flexWrap:       { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Box
        sx={{
          width:          40,
          height:         40,
          flexShrink:     0,
          borderRadius:   1.5,
          bgcolor:        COLORS.white,
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
            fontSize:     "0.9rem",
            fontWeight:   700,
            color:        COLORS.textLabelBlack,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          {file.name}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: COLORS.subText }}>
          {formatSize(file.size)} · {sheetCount} sheet{sheetCount === 1 ? "" : "s"} detected · read-only
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        <Box
          sx={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          0.35,
            px:           1,
            py:           0.35,
            bgcolor:      COLORS.white,
            color:        COLORS.greenDark,
            borderRadius: "999px",
            fontSize:     "0.72rem",
            fontWeight:   700,
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />
          Recognized
        </Box>

        <ButtonBase
          onClick={onReplace}
          sx={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          0.35,
            color:        COLORS.primary,
            fontSize:     "0.82rem",
            fontWeight:   700,
            px:           0.75,
            py:           0.5,
            borderRadius: 1,
            "&:hover":    { bgcolor: COLORS.primarylight },
          }}
        >
          <SwapHorizRoundedIcon sx={{ fontSize: 16 }} />
          Replace
        </ButtonBase>
      </Box>
    </Card>
  )
}
