import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined"

import { COLORS } from "@/lib/constants/colors"

interface ImportMatchedChipProps {
  label?: string
}

export default function ImportMatchedChip({ label = "Matched from filename" }: ImportMatchedChipProps) {
  return (
    <Box
      sx={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          0.5,
        px:           1,
        py:           0.35,
        bgcolor:      COLORS.purpleLighter,
        color:        COLORS.purpleDark,
        borderRadius: "999px",
      }}
    >
      <AutoAwesomeOutlinedIcon sx={{ fontSize: 13 }} />
      <Typography
        component="span"
        sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.01em" }}
      >
        {label}
      </Typography>
    </Box>
  )
}
