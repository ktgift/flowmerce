import type { ReactNode } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { COLORS } from "@/lib/constants/colors"

interface TermRowProps {
  label:    string
  children: ReactNode
}

export default function TermRow({ label, children }: TermRowProps) {
  return (
    <Box
      sx={{
        display:    "flex",
        alignItems: "flex-start",
        gap:        2,
        flexWrap:   { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Typography
        sx={{
          minWidth:  130,
          pt:        0.75,
          fontSize:  "0.85rem",
          color:     COLORS.subText,
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  )
}
