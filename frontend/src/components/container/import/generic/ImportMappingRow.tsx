import { useState } from "react"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"

import AppSelect, { type AppSelectOption } from "@/components/common/AppSelect"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_IGNORE_LABEL, IMPORT_IGNORE_VALUE } from "@/lib/constants/import"

interface ImportMappingRowProps {
  excelColumn: string
  sample:      string
  systemField: string
  options:     AppSelectOption[]
  onChange:    (field: string) => void
}

export default function ImportMappingRow({
  excelColumn,
  sample,
  systemField,
  options,
  onChange,
}: ImportMappingRowProps) {
  const [editing, setEditing] = useState(false)

  const isIgnored = systemField === IMPORT_IGNORE_VALUE
  const fieldLabel = isIgnored ? IMPORT_IGNORE_LABEL : systemField

  return (
    <Box
      sx={{
        display:        "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 28px 1fr 40px" },
        alignItems:     "center",
        columnGap:      1.5,
        rowGap:         1,
        py:             1.5,
        borderTop:      `1px solid ${COLORS.border}`,
        opacity:        isIgnored ? 0.55 : 1,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize:     "0.9rem",
            fontWeight:   600,
            color:        COLORS.textLabelBlack,
            fontFamily:   "ui-monospace, SFMono-Regular, monospace",
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          {excelColumn}
        </Typography>
        <Typography
          sx={{
            fontSize:     "0.75rem",
            color:        COLORS.subText,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          e.g. “{sample}”
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", sm: "flex" }, justifyContent: "center" }}>
        <ArrowForwardIcon sx={{ fontSize: 18, color: COLORS.neutral }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        {editing ? (
          <AppSelect
            value={systemField}
            onChange={(v) => {
              onChange(v)
              setEditing(false)
            }}
            options={options}
            sx={{ width: "100%" }}
          />
        ) : isIgnored ? (
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.subText, fontStyle: "italic" }}>
            {IMPORT_IGNORE_LABEL}
          </Typography>
        ) : (
          <Chip
            label={fieldLabel}
            size="small"
            sx={{
              bgcolor:    COLORS.primarylight,
              color:      COLORS.blueDark,
              fontWeight: 600,
              fontSize:   "0.8rem",
            }}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton size="small" onClick={() => setEditing((v) => !v)}>
          <EditOutlinedIcon sx={{ fontSize: 16, color: COLORS.neutral }} />
        </IconButton>
      </Box>
    </Box>
  )
}
