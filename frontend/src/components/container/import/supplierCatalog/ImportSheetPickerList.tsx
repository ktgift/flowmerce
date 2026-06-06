import { useMemo, useState } from "react"
import Box from "@mui/material/Box"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"

import { COLORS } from "@/lib/constants/colors"
import { classifySheet } from "@/lib/utils/importDetect"
import type { ImportSheetRow } from "@/lib/@types/import"

import ImportSheetRowItem from "./ImportSheetRowItem"

interface ImportSheetPickerListProps {
  sheets:       string[]
  activeSheet:  string | undefined
  bestSheet?:   string
  activeRowCount?: number
  activeColCount?: number
  onChange:     (sheet: string) => void
}

export default function ImportSheetPickerList({
  sheets,
  activeSheet,
  bestSheet,
  activeRowCount,
  activeColCount,
  onChange,
}: ImportSheetPickerListProps) {
  const [showNoise, setShowNoise] = useState(false)

  const rows: ImportSheetRow[] = useMemo(
    () => sheets.map((name) => ({ name, kind: classifySheet(name) })),
    [sheets],
  )

  const dataRows  = rows.filter((r) => r.kind === "data")
  const noiseRows = rows.filter((r) => r.kind === "noise")

  function renderRow(row: ImportSheetRow) {
    const active = row.name === activeSheet
    return (
      <ImportSheetRowItem
        key={row.name}
        row={row}
        active={active}
        isBest={row.name === bestSheet}
        rowCount={active ? activeRowCount : undefined}
        colCount={active ? activeColCount : undefined}
        onClick={() => onChange(row.name)}
      />
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {dataRows.map(renderRow)}

      {noiseRows.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Box
            component="button"
            type="button"
            onClick={() => setShowNoise((v) => !v)}
            sx={{
              display:    "inline-flex",
              alignItems: "center",
              gap:        0.5,
              border:     "none",
              bgcolor:    "transparent",
              color:      COLORS.subText,
              fontSize:   "0.82rem",
              fontWeight: 500,
              cursor:     "pointer",
              p:          0,
              "&:hover":  { color: COLORS.primary },
            }}
          >
            {showNoise ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
            {showNoise
              ? `Hide ${noiseRows.length} non-data sheet${noiseRows.length === 1 ? "" : "s"}`
              : `Show ${noiseRows.length} more sheet${noiseRows.length === 1 ? "" : "s"} (legend, log, dropdowns)`}
          </Box>

          {showNoise && (
            <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
              {noiseRows.map(renderRow)}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
