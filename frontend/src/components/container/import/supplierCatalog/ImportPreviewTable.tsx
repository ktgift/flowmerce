import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded"

import DataTable, { type TableColumn } from "@/components/common/DataTable"
import StatusBadge from "@/components/common/StatusBadge"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_FIELD_LABELS, IMPORT_IGNORE_VALUE } from "@/lib/constants/import"
import { validatePreviewRow, type PreviewRowValidation } from "@/lib/utils/importPreviewValidate"
import type { ImportTargetTable } from "@/lib/@types/import"

import ImportPreviewActionCell, { type PreviewAction } from "./ImportPreviewActionCell"

interface ImportPreviewTableProps {
  targetTable:   ImportTargetTable
  columnMapping: Record<string, string>
  previewRows:   Record<string, string>[]
  totalRowCount: number
}

interface PreviewRowDisplay {
  index:  number
  raw:    Record<string, string>
  result: PreviewRowValidation
  action: PreviewAction
}

const MAX_PREVIEW = 8
const NUMERIC_SUFFIXES = ["_price", "qty_on_hand"]

function isNumericField(field: string): boolean {
  return NUMERIC_SUFFIXES.some((s) => field === s || field.endsWith(s))
}

export default function ImportPreviewTable({
  targetTable,
  columnMapping,
  previewRows,
  totalRowCount,
}: ImportPreviewTableProps) {
  const mapped = useMemo(
    () =>
      Object.entries(columnMapping)
        .filter(([, field]) => field && field !== IMPORT_IGNORE_VALUE)
        .map(([excel, field]) => ({ excel, field })),
    [columnMapping],
  )

  const fieldLabelMap = useMemo(
    () => IMPORT_FIELD_LABELS[targetTable] ?? {},
    [targetTable],
  )

  const rows: PreviewRowDisplay[] = useMemo(
    () =>
      previewRows.slice(0, MAX_PREVIEW).map((raw, index) => {
        const result = validatePreviewRow(raw, mapped, targetTable)
        return {
          index,
          raw,
          result,
          action: result.hasIssue ? "skip" : "create",
        }
      }),
    [previewRows, mapped, targetTable],
  )

  const validCount   = rows.filter((r) => !r.result.hasIssue).length
  const invalidCount = rows.length - validCount

  const columns: TableColumn<PreviewRowDisplay>[] = useMemo(() => {
    const head: TableColumn<PreviewRowDisplay> = {
      key:    "__status",
      label:  "",
      width:  44,
      render: (row) =>
        row.result.hasIssue
          ? <ErrorOutlineRoundedIcon sx={{ fontSize: 18, color: COLORS.error }} />
          : <CheckCircleRoundedIcon sx={{ fontSize: 18, color: COLORS.success }} />,
    }

    const mappedCols: TableColumn<PreviewRowDisplay>[] = mapped.map(({ excel, field }) => ({
      key:    excel,
      label:  (fieldLabelMap[field] ?? field).toUpperCase(),
      align:  isNumericField(field) ? "right" : "left",
      render: (row) => {
        const cell = row.result.cells[excel]
        if (!cell) return row.raw[excel] ?? "—"
        return (
          <Box
            component="span"
            sx={{
              fontSize:  "0.85rem",
              color:     cell.issue ? COLORS.error : COLORS.text,
              fontStyle: cell.isEmpty && cell.issue ? "italic" : "normal",
              fontFamily: cell.align === "right" || excel.toLowerCase().includes("code")
                ? "ui-monospace, SFMono-Regular, monospace"
                : undefined,
            }}
          >
            {cell.display}
          </Box>
        )
      },
    }))

    const action: TableColumn<PreviewRowDisplay> = {
      key:    "__action",
      label:  "ACTION",
      align:  "right",
      width:  100,
      render: (row) => <ImportPreviewActionCell action={row.action} />,
    }

    return [head, ...mappedCols, action]
  }, [mapped, fieldLabelMap])

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
            Preview
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText, mt: 0.25 }}>
            First {rows.length} of {totalRowCount.toLocaleString()} mapped rows
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          <StatusBadge
            status={`${validCount} valid`}
            backgroundColor={COLORS.greenLight}
            color={COLORS.greenDark}
          />
          <StatusBadge
            status={`${invalidCount} need attention`}
            backgroundColor={invalidCount > 0 ? COLORS.redLighter : COLORS.grayLighter}
            color={invalidCount > 0 ? COLORS.redDark : COLORS.grayDark}
          />
        </Box>
      </Box>

      <DataTable<PreviewRowDisplay>
        rows={rows}
        columns={columns}
        total={rows.length}
        page={0}
        pageSize={MAX_PREVIEW}
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
        headerAlign="left"
        cellAlign="left"
        noPagination
      />
    </Box>
  )
}
