import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import BoltOutlinedIcon       from "@mui/icons-material/BoltOutlined"
import InfoOutlinedIcon       from "@mui/icons-material/InfoOutlined"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"

import { COLORS } from "@/lib/constants/colors"
import { IMPORT_MODES } from "@/lib/constants/import"
import type { ImportMode, ImportModeMeta } from "@/lib/@types/import"

interface ImportModeToggleProps {
  value:    ImportMode
  onChange: (mode: ImportMode) => void
  hint?:    string
  disabled?: boolean
}

function renderIcon(name: ImportModeMeta["iconName"]) {
  if (name === "bolt") return <BoltOutlinedIcon sx={{ fontSize: 16 }} />
  return <LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />
}

export default function ImportModeToggle({
  value,
  onChange,
  hint,
  disabled,
}: ImportModeToggleProps) {
  return (
    <Box
      sx={{
        display:        "flex",
        flexDirection:  { xs: "column", sm: "row" },
        alignItems:     { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap:            1.5,
      }}
    >
      <Box sx={{ display: "inline-flex", gap: 0.5 }}>
        {IMPORT_MODES.map((mode) => {
          const selected = mode.value === value
          return (
            <Box
              key={mode.value}
              component="button"
              type="button"
              disabled={disabled}
              onClick={() => onChange(mode.value)}
              sx={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          0.75,
                px:           1.75,
                py:           0.75,
                border:       "1px solid",
                borderColor:  selected ? COLORS.textLabelBlack : "transparent",
                borderRadius: "999px",
                bgcolor:      selected ? COLORS.white : "transparent",
                color:        selected ? COLORS.textLabelBlack : COLORS.subText,
                fontWeight:   selected ? 700 : 500,
                fontSize:     "0.85rem",
                cursor:       disabled ? "default" : "pointer",
                boxShadow:    selected ? "0 1px 2px rgba(60,60,67,0.06)" : "none",
                transition:   "all 0.18s ease",
                "&:hover:not(:disabled)": {
                  color: selected ? COLORS.textLabelBlack : COLORS.text,
                },
                "&:disabled": { opacity: 0.5 },
              }}
            >
              {renderIcon(mode.iconName)}
              <span>{mode.label}</span>
            </Box>
          )
        })}
      </Box>

      {hint && (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, color: COLORS.subText }}>
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: "0.82rem", color: COLORS.subText }}>
            {hint}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
