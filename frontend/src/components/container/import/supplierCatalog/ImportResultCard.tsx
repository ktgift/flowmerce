import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import type { ExecuteResponse } from "@/lib/@types/import"

import ImportDetailRow from "./ImportDetailRow"
import ImportStatTile  from "./ImportStatTile"

interface ImportResultCardProps {
  result:        ExecuteResponse
  supplierName:  string | null
  templateName:  string | null
  fileName:      string
}

export default function ImportResultCard({
  result,
  supplierName,
  templateName,
  fileName,
}: ImportResultCardProps) {
  const synced = result.createdRows + result.updatedRows

  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2.5 }}>
        <Box
          sx={{
            width:          64,
            height:         64,
            borderRadius:   "50%",
            bgcolor:        COLORS.greenLight,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            mb:             1.5,
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 36, color: COLORS.greenDark }} />
        </Box>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: COLORS.textLabelBlack }}>
          Import complete
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", color: COLORS.subText, mt: 0.5, textAlign: "center" }}>
          {synced.toLocaleString()} {synced === 1 ? "product" : "products"} synced
          {supplierName ? ` to ${supplierName}` : ""}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap:     1.5,
          mb:      2,
        }}
      >
        <ImportStatTile
          value={result.createdRows}
          label="created"
          color={COLORS.greenDark}
          bgColor={COLORS.greenLight}
        />
        <ImportStatTile
          value={result.updatedRows}
          label="updated"
          color={COLORS.primary}
          bgColor={COLORS.primarylight}
        />
        <ImportStatTile
          value={result.skippedRows}
          label="skipped"
          color={COLORS.grayDark}
          bgColor={COLORS.grayLighter}
        />
      </Box>

      <Box sx={{ bgcolor: COLORS.backgroundDefault, borderRadius: 2, px: 2, py: 0.5 }}>
        <ImportDetailRow isFirst label="File"     value={fileName} />
        {templateName && <ImportDetailRow label="Template" value={templateName} />}
        <ImportDetailRow label="Total rows" value={result.totalRows.toLocaleString()} />
      </Box>
    </Card>
  )
}
