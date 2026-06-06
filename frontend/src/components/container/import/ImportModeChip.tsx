import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"

import { COLORS } from "@/lib/constants/colors"

export default function ImportModeChip() {
  return (
    <Box
      sx={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            0.5,
        px:             1.25,
        py:             0.35,
        bgcolor:        COLORS.purpleLighter,
        color:          COLORS.purpleDark,
        borderRadius:   "999px",
        verticalAlign:  "middle",
      }}
    >
      <LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />
      <Typography
        component="span"
        sx={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.01em" }}
      >
        Supplier catalog
      </Typography>
    </Box>
  )
}
