import Chip from "@mui/material/Chip"
import Typography from "@mui/material/Typography"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

interface StatTileProps {
  label: string
  value: number | string
  chipBg?:    string
  chipColor?: string
}

export default function StatTile({ label, value, chipBg, chipColor }: StatTileProps) {
  const useChip = Boolean(chipBg && chipColor)

  return (
    <Card
      sx={{
        flex:           1,
        minWidth:       0,
        px:             2,
        py:             1.5,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "flex-start",
        gap:            0.75,
        bgcolor:        COLORS.backgroundPaper,
      }}
    >
      <Typography
        sx={{
          fontSize:      "0.75rem",
          color:         COLORS.subText,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontWeight:    600,
        }}
      >
        {label}
      </Typography>
      {useChip ? (
        <Chip
          size="small"
          label={value}
          sx={{
            bgcolor:    chipBg,
            color:      chipColor,
            fontWeight: 700,
            fontSize:   "0.875rem",
            px:         0.5,
          }}
        />
      ) : (
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
          {value}
        </Typography>
      )}
    </Card>
  )
}
