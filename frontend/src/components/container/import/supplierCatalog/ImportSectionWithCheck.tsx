import type { ReactNode } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded"

import { COLORS } from "@/lib/constants/colors"

interface ImportSectionWithCheckProps {
  title:      string
  titleChip?: ReactNode
  hint?:      ReactNode
  done?:     boolean
  isLast?:   boolean
  children:   ReactNode
}

export default function ImportSectionWithCheck({
  title,
  titleChip,
  hint,
  done    = false,
  isLast  = false,
  children,
}: ImportSectionWithCheckProps) {
  return (
    <Box sx={{ display: "flex", gap: { xs: 1.25, sm: 2 } }}>
      <Box
        sx={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          flexShrink:     0,
          pt:             0.25,
        }}
      >
        {done
          ? <CheckCircleRoundedIcon sx={{ fontSize: 24, color: COLORS.success }} />
          : <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 24, color: COLORS.border }} />}
        {!isLast && (
          <Box
            sx={{
              flexGrow:  1,
              width:     2,
              bgcolor:   done ? COLORS.success : COLORS.border,
              mt:        0.5,
              minHeight: 16,
            }}
          />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0, pb: isLast ? 0 : 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: hint ? 0.5 : 1.25 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
            {title}
          </Typography>
          {titleChip}
        </Box>
        {hint && (
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.subText, mb: 1.5, lineHeight: 1.5 }}>
            {hint}
          </Typography>
        )}
        {children}
      </Box>
    </Box>
  )
}
