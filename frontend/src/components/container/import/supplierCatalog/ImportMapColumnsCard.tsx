import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { IMPORT_SYSTEM_FIELDS } from "shared"
import StatusBadge from "@/components/common/StatusBadge"
import Card from "@/components/common/Card"
import { type AppSelectOption } from "@/components/common/AppSelect"
import { COLORS } from "@/lib/constants/colors"
import {
  IMPORT_FIELD_LABELS,
  IMPORT_FIELD_RULES,
  IMPORT_IGNORE_LABEL,
  IMPORT_IGNORE_VALUE,
} from "@/lib/constants/import"
import type { ImportTargetTable } from "@/lib/@types/import"

import ImportMapColumnRow from "./ImportMapColumnRow"

interface ImportMapColumnsCardProps {
  targetTable:   ImportTargetTable
  headers:       string[]
  sampleByHeader: Record<string, string>
  columnMapping: Record<string, string>
  onChange:      (header: string, field: string) => void
}

export default function ImportMapColumnsCard({
  targetTable,
  headers,
  sampleByHeader,
  columnMapping,
  onChange,
}: ImportMapColumnsCardProps) {
  const fieldOptions: AppSelectOption[] = useMemo(() => {
    const rules  = IMPORT_FIELD_RULES[targetTable] ?? {}
    const labels = IMPORT_FIELD_LABELS[targetTable] ?? {}
    return [
      { value: IMPORT_IGNORE_VALUE, label: IMPORT_IGNORE_LABEL },
      ...IMPORT_SYSTEM_FIELDS[targetTable].map((id) => {
        const required = rules[id]?.required ? " *" : ""
        const label    = labels[id] ?? id
        return { value: id, label: `${id}${required} — ${label}` }
      }),
    ]
  }, [targetTable])

  const mappedCount = headers.filter(
    (h) => (columnMapping[h] ?? "") !== IMPORT_IGNORE_VALUE,
  ).length
  const totalCount = headers.length
  const allMapped  = mappedCount === totalCount && totalCount > 0

  return (
    <Card sx={{ p: { xs: 2, md: 2.5 } }}>
      <Box
        sx={{
          display:        "flex",
          alignItems:     { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap:            1.5,
          flexWrap:       "wrap",
          mb:             1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
            Map columns
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: COLORS.subText, mt: 0.25 }}>
            We auto-matched {mappedCount} of {totalCount} columns — adjust anything that looks off.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          <StatusBadge
            status={`${mappedCount} / ${totalCount} mapped`}
            backgroundColor={allMapped ? COLORS.greenLight : COLORS.orangeLight}
            color={allMapped ? COLORS.greenDark : COLORS.orangeDark}
          />
          <StatusBadge
            status={allMapped ? "ready" : "review"}
            backgroundColor={allMapped ? COLORS.greenLight : COLORS.orangeLight}
            color={allMapped ? COLORS.greenDark : COLORS.orangeDark}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 0.5 }}>
        {headers.map((header, idx) => (
          <ImportMapColumnRow
            key={header}
            header={header}
            sample={sampleByHeader[header] ?? ""}
            field={columnMapping[header] ?? IMPORT_IGNORE_VALUE}
            options={fieldOptions}
            onChange={(field) => onChange(header, field)}
            isFirst={idx === 0}
          />
        ))}
      </Box>
    </Card>
  )
}
