import type { ReactNode } from "react"
import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"

import type { ImportTargetTable } from "shared"
import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_IGNORE_VALUE } from "@/lib/constants/import"
import {
  validatePreviewRow,
  type PreviewCellInfo,
  type PreviewRowValidation,
} from "@/lib/utils/importPreviewValidate"

interface MappedColumn {
  excel: string
  field: string
}

interface ImportPreviewDataCardProps {
  headers:       string[]
  columnMapping: Record<string, string>
  previewRows:   Record<string, string>[]
  targetTable:   ImportTargetTable
  totalRows:     number
  validCount:    number
  issueCount:    number
}

export default function ImportPreviewDataCard({
  headers,
  columnMapping,
  previewRows,
  targetTable,
  totalRows,
  validCount,
  issueCount,
}: ImportPreviewDataCardProps) {
  const mappedColumns: MappedColumn[] = useMemo(
    () =>
      headers
        .filter(
          (h) => (columnMapping[h] ?? IMPORT_IGNORE_VALUE) !== IMPORT_IGNORE_VALUE,
        )
        .map((excel) => ({ excel, field: columnMapping[excel] })),
    [headers, columnMapping],
  )

  const rows: PreviewRowValidation[] = useMemo(
    () => previewRows.map((row) => validatePreviewRow(row, mappedColumns, targetTable)),
    [previewRows, mappedColumns, targetTable],
  )

  const gridTemplate = `48px repeat(${mappedColumns.length}, minmax(120px, 1fr))`

  return (
    <Card sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px:            { xs: 2, md: 3 },
          pt:            2.5,
          pb:            2,
          display:       "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems:    { xs: "stretch", sm: "flex-start" },
          gap:           1.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize:   "1.125rem",
              fontWeight: 700,
              color:      COLORS.textLabelBlack,
            }}
          >
            Preview Data
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: COLORS.subText, mt: 0.25 }}>
            Showing first {previewRows.length} of {totalRows.toLocaleString()} rows
            {" — Validate before importing"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <StatusChip
            icon={<CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />}
            label={`${validCount.toLocaleString()} valid`}
            bg={COLORS.greenLight}
            color={COLORS.greenDark}
          />
          <StatusChip
            icon={<WarningAmberRoundedIcon sx={{ fontSize: 16 }} />}
            label={`${issueCount.toLocaleString()} issues`}
            bg={COLORS.redLighter}
            color={COLORS.redDark}
          />
        </Box>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: mappedColumns.length * 140 + 48 }}>
          <Box
            sx={{
              display:             "grid",
              gridTemplateColumns: gridTemplate,
              alignItems:          "center",
              borderTop:           `1px solid ${COLORS.border}`,
              px:                  2,
              py:                  1.5,
              bgcolor:             COLORS.backgroundPaper,
            }}
          >
            <Box />
            {mappedColumns.map(({ excel, field }) => (
              <Box
                key={excel}
                sx={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        0.5,
                  pr:         1,
                  flexWrap:   "wrap",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize:      "0.7rem",
                    fontWeight:    700,
                    letterSpacing: "0.06em",
                    color:         COLORS.subText,
                    textTransform: "uppercase",
                  }}
                >
                  {excel}
                </Typography>
                <ArrowRightAltIcon sx={{ fontSize: 16, color: COLORS.subText }} />
                <Typography
                  component="span"
                  sx={{
                    fontSize:      "0.7rem",
                    fontWeight:    700,
                    letterSpacing: "0.06em",
                    color:         COLORS.primary,
                    textTransform: "uppercase",
                  }}
                >
                  {field}
                </Typography>
              </Box>
            ))}
          </Box>

          {rows.map((row, idx) => (
            <Box
              key={idx}
              sx={{
                display:             "grid",
                gridTemplateColumns: gridTemplate,
                alignItems:          "center",
                borderTop:           `1px solid ${COLORS.border}`,
                px:                  2,
                py:                  1.75,
                bgcolor:             row.hasIssue ? COLORS.redLighter : "transparent",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {row.hasIssue ? (
                  <WarningAmberRoundedIcon sx={{ fontSize: 20, color: COLORS.redDark }} />
                ) : (
                  <CheckCircleOutlinedIcon sx={{ fontSize: 20, color: COLORS.greenDark }} />
                )}
              </Box>
              {mappedColumns.map(({ excel }) => (
                <PreviewCell key={excel} cell={row.cells[excel]} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  )
}

function StatusChip({
  icon,
  label,
  bg,
  color,
}: {
  icon:  ReactNode
  label: string
  bg:    string
  color: string
}) {
  return (
    <Box
      sx={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          0.5,
        bgcolor:      bg,
        color,
        px:           1.25,
        py:           0.5,
        borderRadius: 999,
        fontSize:     "0.78rem",
        fontWeight:   600,
        lineHeight:   1.2,
      }}
    >
      {icon}
      {label}
    </Box>
  )
}

function PreviewCell({ cell }: { cell: PreviewCellInfo }) {
  if (cell.isEmpty && cell.issue) {
    return (
      <Typography
        sx={{
          fontSize:    "0.85rem",
          color:       COLORS.redDark,
          fontStyle:   "italic",
          textAlign:   cell.align,
          pr:          cell.align === "right" ? 1 : 0,
        }}
      >
        (empty)
      </Typography>
    )
  }

  const errored = Boolean(cell.issue)
  return (
    <Typography
      sx={{
        fontSize:  "0.85rem",
        color:     errored ? COLORS.redDark : COLORS.text,
        textAlign: cell.align,
        pr:        cell.align === "right" ? 1 : 0,
        whiteSpace: "nowrap",
        overflow:   "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {cell.display}
    </Typography>
  )
}
