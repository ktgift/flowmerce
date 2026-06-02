import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import type { AppSelectOption } from "@/components/common/AppSelect"
import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_IGNORE_VALUE } from "@/lib/constants/import"

import ImportMappingRow from "./ImportMappingRow"

export interface ImportMappingRowData {
  header: string
  sample: string
}

interface ImportMappingPreviewCardProps {
  title:         string
  rows:          ImportMappingRowData[]
  columnMapping: Record<string, string>
  fieldOptions:  AppSelectOption[]
  onColumnChange: (header: string, field: string) => void
  hint?:         string
}

export default function ImportMappingPreviewCard({
  title,
  rows,
  columnMapping,
  fieldOptions,
  onColumnChange,
  hint,
}: ImportMappingPreviewCardProps) {
  const mappedCount = rows.filter(
    (r) => (columnMapping[r.header] ?? IMPORT_IGNORE_VALUE) !== IMPORT_IGNORE_VALUE,
  ).length

  return (
    <Card sx={{ px: { xs: 2, md: 2.5 }, pt: 2, pb: 1 }}>
      <Box
        sx={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            1,
          mb:             0.5,
        }}
      >
        <Typography
          sx={{ fontSize: "0.95rem", fontWeight: 700, color: COLORS.textLabelBlack }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText }}>
          Mapped {mappedCount}/{rows.length}
        </Typography>
      </Box>

      {hint && (
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText, mb: 0.5 }}>
          {hint}
        </Typography>
      )}

      <Box
        sx={{
          display:               "grid",
          gridTemplateColumns:   { xs: "1fr", sm: "1fr 28px 1fr 40px" },
          columnGap:             1.5,
          pt:                    1,
          pb:                    0.5,
        }}
      >
        <Typography
          sx={{
            fontSize:      "0.7rem",
            fontWeight:    700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         COLORS.subText,
          }}
        >
          Excel Column
        </Typography>
        <Box />
        <Typography
          sx={{
            fontSize:      "0.7rem",
            fontWeight:    700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         COLORS.subText,
          }}
        >
          System Field
        </Typography>
        <Box />
      </Box>

      {rows.map((row) => (
        <ImportMappingRow
          key={row.header}
          excelColumn={row.header}
          sample={row.sample}
          systemField={columnMapping[row.header] ?? IMPORT_IGNORE_VALUE}
          options={fieldOptions}
          onChange={(field) => onColumnChange(row.header, field)}
        />
      ))}
    </Card>
  )
}
