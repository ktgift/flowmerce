import { Box } from "@mui/material"
import type { PoStatusSummaryItem } from "@/lib/@types/po"
import { PO_STATUS_BAR_COLORS, COLORS } from "@/lib/constants/colors"

interface Props {
  items: PoStatusSummaryItem[]
  total: number
}

export default function PoStatusBar({ items, total }: Props) {
  if (total === 0) return null
  return (
    <Box sx={{ display: "flex", gap: "2px", height: 8, my: 2 }}>
      {items.map((item) => (
        <Box
          key={item.status}
          sx={{
            flex: item.count / total,
            height: "100%",
            bgcolor: PO_STATUS_BAR_COLORS[item.status] ?? COLORS.grayMedium,
            borderRadius: "999px",
            minWidth: 4,
            transition: "flex 0.4s ease",
          }}
        />
      ))}
    </Box>
  )
}
