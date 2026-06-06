import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"

import { COLORS } from "@/lib/constants/colors"

import ImportFooterSummaryChip from "./ImportFooterSummaryChip"

interface ImportContextHeaderProps {
  supplierName: string | null
  sheetName:    string | undefined
  rowCount:     number
}

export default function ImportContextHeader({
  supplierName,
  sheetName,
  rowCount,
}: ImportContextHeaderProps) {
  return (
    <Box
      sx={{
        display:    "flex",
        alignItems: "center",
        gap:        0.75,
        flexWrap:   "wrap",
      }}
    >
      {supplierName && (
        <ImportFooterSummaryChip
          icon={<LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />}
          label={supplierName}
          highlight
        />
      )}
      {supplierName && sheetName && (
        <Typography component="span" sx={{ color: COLORS.neutral, fontSize: "0.8rem" }}>
          ›
        </Typography>
      )}
      {sheetName && (
        <ImportFooterSummaryChip
          icon={<GridOnOutlinedIcon sx={{ fontSize: 14 }} />}
          label={sheetName}
        />
      )}
      <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText, ml: 0.5 }}>
        · {rowCount.toLocaleString()} rows
      </Typography>
    </Box>
  )
}
