import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

import ImportFooterSummaryChip from "./ImportFooterSummaryChip"

interface ImportMatchTemplateFooterProps {
  rowCount:     number
  sheetName:    string | undefined
  supplierName: string | null
  onContinue:   () => void
  disabled?:    boolean
}

export default function ImportMatchTemplateFooter({
  rowCount,
  sheetName,
  supplierName,
  onContinue,
  disabled,
}: ImportMatchTemplateFooterProps) {
  return (
    <Card
      sx={{
        display:        "flex",
        flexDirection:  { xs: "column", sm: "row" },
        alignItems:     { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap:            1.5,
        px:             2,
        py:             1.5,
      }}
    >
      <Box
        sx={{
          display:    "flex",
          alignItems: "center",
          gap:        1,
          minWidth:   0,
          flexWrap:   "wrap",
        }}
      >
        <ImportFooterSummaryChip
          icon={<TableRowsOutlinedIcon sx={{ fontSize: 15 }} />}
          label={`${rowCount.toLocaleString()} rows`}
        />
        {sheetName && (
          <Typography component="span" sx={{ color: COLORS.neutral, fontSize: "0.8rem" }}>
            ›
          </Typography>
        )}
        {sheetName && (
          <Typography
            sx={{
              fontSize:     "0.82rem",
              color:        COLORS.text,
              fontWeight:   600,
              maxWidth:     { xs: 140, sm: 220 },
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {sheetName}
          </Typography>
        )}
        {supplierName && (
          <Typography component="span" sx={{ color: COLORS.neutral, fontSize: "0.8rem" }}>
            ›
          </Typography>
        )}
        {supplierName && (
          <ImportFooterSummaryChip
            icon={<LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />}
            label={supplierName}
            highlight
          />
        )}
      </Box>

      <Button
        variant="contained"
        onClick={onContinue}
        disabled={disabled}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
        sx={{
          textTransform: "none",
          fontWeight:    700,
          px:            3,
          flexShrink:    0,
        }}
      >
        Continue to mapping
      </Button>
    </Card>
  )
}
