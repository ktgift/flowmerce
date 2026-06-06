import type { ReactNode } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { COLORS } from "@/lib/constants/colors"

interface ImportDetailRowProps {
  label:    string
  value:    ReactNode
  isFirst?: boolean
}

export default function ImportDetailRow({ label, value, isFirst }: ImportDetailRowProps) {
  return (
    <Box
      sx={{
        display:             "grid",
        gridTemplateColumns: { xs: "1fr", sm: "120px minmax(0, 1fr)" },
        alignItems:          "center",
        gap:                 1.5,
        py:                  1.25,
        borderTop:           isFirst ? "none" : `1px solid ${COLORS.border}`,
      }}
    >
      <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box
        sx={{
          fontSize:    "0.85rem",
          color:       COLORS.textLabelBlack,
          fontWeight:  600,
          fontFamily:  "ui-monospace, SFMono-Regular, monospace",
          overflow:    "hidden",
          textOverflow: "ellipsis",
          whiteSpace:  "nowrap",
        }}
      >
        {value}
      </Box>
    </Box>
  )
}
