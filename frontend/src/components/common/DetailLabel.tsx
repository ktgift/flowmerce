import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { COLORS } from "@/lib/constants/colors"

interface DetailLabelProps {
  label: string
  value: string | null | undefined
}

export default function DetailLabel({ label, value }: DetailLabelProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize:      "0.68rem",
          fontWeight:    600,
          color:         COLORS.subText,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          mb:            0.25,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: COLORS.text, fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  )
}
