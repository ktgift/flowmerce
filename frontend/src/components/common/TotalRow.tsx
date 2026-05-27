import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { COLORS } from "@/lib/constants/colors"

interface TotalRowProps {
  label:   string
  value:   number
  bold?:   boolean
  prefix?: string
}

export default function TotalRow({ label, value, bold, prefix = "฿" }: TotalRowProps) {
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
      <Typography
        sx={{
          fontSize:  bold ? "0.9rem" : "0.83rem",
          fontWeight: bold ? 700 : 400,
          color:     bold ? COLORS.text : COLORS.subText,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize:          bold ? "0.95rem" : "0.83rem",
          fontWeight:        bold ? 800 : 600,
          color:             COLORS.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {prefix}{formatted}
      </Typography>
    </Box>
  )
}
