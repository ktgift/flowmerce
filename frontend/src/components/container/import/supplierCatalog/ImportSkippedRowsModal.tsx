import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded"

import { COLORS } from "@/lib/constants/colors"
import { IMPORT_IGNORE_VALUE } from "@/lib/constants/import"
import { validatePreviewRow } from "@/lib/utils/importPreviewValidate"
import type { ImportTargetTable } from "@/lib/@types/import"

interface SkippedItem {
  rowLabel: string
  reason:   string
}

interface ImportSkippedRowsModalProps {
  totalSkipped:  number
  errors:        string[]
  previewRows:   Record<string, string>[]
  columnMapping: Record<string, string>
  targetTable:   ImportTargetTable
}

const ISSUE_REASONS: Record<string, string> = {
  empty_required: "Missing required value",
  not_a_number:   "Value is not a number",
  below_min:      "Value is below allowed minimum",
}

export default function ImportSkippedRowsModal({
  totalSkipped,
  errors,
  previewRows,
  columnMapping,
  targetTable,
}: ImportSkippedRowsModalProps) {
  const items: SkippedItem[] = useMemo(() => {
    if (errors.length > 0) {
      return errors.map((message, idx) => ({
        rowLabel: `Issue ${idx + 1}`,
        reason:   message,
      }))
    }

    const mapped = Object.entries(columnMapping)
      .filter(([, field]) => field && field !== IMPORT_IGNORE_VALUE)
      .map(([excel, field]) => ({ excel, field }))

    const list: SkippedItem[] = []
    previewRows.forEach((row, idx) => {
      const result = validatePreviewRow(row, mapped, targetTable)
      if (!result.hasIssue) return
      const reasons = Object.entries(result.cells)
        .filter(([, cell]) => cell.issue)
        .map(([excel, cell]) => `${excel}: ${ISSUE_REASONS[cell.issue ?? ""] ?? "Invalid"}`)
      list.push({
        rowLabel: `Row ${idx + 2}`,
        reason:   reasons.join(" · "),
      })
    })
    return list
  }, [errors, previewRows, columnMapping, targetTable])

  return (
    <Box>
      <Box
        sx={{
          display:      "flex",
          alignItems:   "center",
          gap:          1.25,
          p:            1.5,
          mb:           2,
          bgcolor:      COLORS.orangeLight,
          borderRadius: 2,
        }}
      >
        <ErrorOutlineRoundedIcon sx={{ fontSize: 22, color: COLORS.orangeDark }} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: COLORS.orangeDark }}>
            {totalSkipped.toLocaleString()} {totalSkipped === 1 ? "row" : "rows"} will be skipped
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: COLORS.orangeDark, opacity: 0.85 }}>
            These rows won't be written to your catalog. Fix the source file or ignore — your call.
          </Typography>
        </Box>
      </Box>

      {items.length === 0 ? (
        <Typography sx={{ fontSize: "0.85rem", color: COLORS.subText, py: 2, textAlign: "center" }}>
          We don't have row-level details for these skips.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display:      "flex",
                gap:          1.5,
                p:            1.25,
                border:       `1px solid ${COLORS.border}`,
                borderRadius: 1.5,
                bgcolor:      COLORS.backgroundDefault,
              }}
            >
              <Typography
                sx={{
                  fontSize:   "0.78rem",
                  fontWeight: 700,
                  color:      COLORS.subText,
                  minWidth:   60,
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                }}
              >
                {item.rowLabel}
              </Typography>
              <Typography
                sx={{
                  fontSize:   "0.82rem",
                  color:      COLORS.text,
                  flexGrow:   1,
                  minWidth:   0,
                  wordBreak:  "break-word",
                }}
              >
                {item.reason}
              </Typography>
            </Box>
          ))}

          {errors.length === 0 && items.length < totalSkipped && (
            <Typography
              sx={{
                fontSize:  "0.75rem",
                color:     COLORS.subText,
                mt:        1,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Showing details for the first {items.length} of {totalSkipped} skipped rows.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}
