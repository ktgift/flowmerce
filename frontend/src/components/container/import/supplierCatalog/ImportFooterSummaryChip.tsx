import type { ReactNode } from "react"
import Box from "@mui/material/Box"

import { COLORS } from "@/lib/constants/colors"

interface ImportFooterSummaryChipProps {
  icon:       ReactNode
  label:      string
  highlight?: boolean
}

export default function ImportFooterSummaryChip({
  icon,
  label,
  highlight,
}: ImportFooterSummaryChipProps) {
  return (
    <Box
      sx={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          0.5,
        px:           0.75,
        py:           0.35,
        bgcolor:      highlight ? COLORS.purpleLighter : COLORS.pillBg,
        color:        highlight ? COLORS.purpleDark : COLORS.text,
        borderRadius: "999px",
        fontSize:     "0.78rem",
        fontWeight:   600,
        minWidth:     0,
      }}
    >
      {icon}
      <Box
        component="span"
        sx={{
          overflow:     "hidden",
          textOverflow: "ellipsis",
          whiteSpace:   "nowrap",
          maxWidth:     { xs: 120, sm: 180 },
        }}
      >
        {label}
      </Box>
    </Box>
  )
}
