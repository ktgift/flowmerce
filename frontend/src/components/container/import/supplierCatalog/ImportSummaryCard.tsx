import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import type { ExecuteResponse } from "@/lib/@types/import"

import ImportDetailRow from "./ImportDetailRow"
import ImportStatTile  from "./ImportStatTile"

interface ImportSummaryCardProps {
  result:        ExecuteResponse
  fileName:      string
  supplierName:  string | null
  sheetName:     string | undefined
  rowCount:      number
  templateName:  string | null
  upsertKey:     string
  onClickSkip?:  () => void
}

export default function ImportSummaryCard({
  result,
  fileName,
  supplierName,
  sheetName,
  rowCount,
  templateName,
  upsertKey,
  onClickSkip,
}: ImportSummaryCardProps) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 } }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
          Ready to import
        </Typography>
        <Typography sx={{ fontSize: "0.82rem", color: COLORS.subText, mt: 0.25 }}>
          Review the details below — nothing is written until you confirm.
        </Typography>
      </Box>

      <Box
        sx={{
          display:     "flex",
          alignItems:  "stretch",
          borderTop:   `1px solid ${COLORS.border}`,
          borderBottom: `1px solid ${COLORS.border}`,
          py:          0.5,
          mb:          2,
          "& > * + *": { borderLeft: `1px solid ${COLORS.border}` },
        }}
      >
        <ImportStatTile value={result.createdRows} label="to create" color={COLORS.greenDark} />
        <ImportStatTile value={result.updatedRows} label="to update" color={COLORS.primary} />
        <ImportStatTile
          value={result.skippedRows}
          label="to skip"
          color={COLORS.grayDark}
          onClick={result.skippedRows > 0 && onClickSkip ? onClickSkip : undefined}
        />
      </Box>

      <Box>
        <ImportDetailRow isFirst label="File"       value={fileName} />
        {supplierName && <ImportDetailRow label="Supplier" value={supplierName} />}
        {sheetName && (
          <ImportDetailRow
            label="Sheet"
            value={`${sheetName} · ${rowCount.toLocaleString()} rows`}
          />
        )}
        {templateName && <ImportDetailRow label="Template"  value={templateName} />}
        <ImportDetailRow label="Upsert key" value={upsertKey} />
      </Box>
    </Card>
  )
}
