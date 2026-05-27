import Box from "@mui/material/Box"
import { COLORS } from "@/lib/constants/colors"

interface MarginBadgeProps {
  value: number | null | undefined
}

export default function MarginBadge({ value }: MarginBadgeProps) {
  if (value == null) return null

  const color =
    value >= 20 ? COLORS.success :
    value >= 10 ? COLORS.warning :
    COLORS.error

  return (
    <Box
      component="span"
      sx={{
        display:      "inline-flex",
        alignItems:   "center",
        px:           0.75,
        py:           0.25,
        borderRadius: 1,
        bgcolor:      `${color}22`,
        fontSize:     "0.72rem",
        fontWeight:   700,
        color,
      }}
    >
      ● {value.toFixed(1)} %
    </Box>
  )
}
