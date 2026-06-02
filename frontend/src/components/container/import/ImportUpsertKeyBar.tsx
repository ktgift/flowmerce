import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import ButtonBase from "@mui/material/ButtonBase"
import Typography from "@mui/material/Typography"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

import AppSelect, { type AppSelectOption } from "@/components/common/AppSelect"
import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

interface ImportUpsertKeyBarProps {
  upsertKey:     string
  options:       AppSelectOption[]
  onChange:      (value: string) => void
  onPreview:     () => void
  onEditMapping?: () => void
  previewLabel?: string
  previewDisabled?: boolean
}

export default function ImportUpsertKeyBar({
  upsertKey,
  options,
  onChange,
  onPreview,
  onEditMapping,
  previewLabel = "Preview Data",
  previewDisabled = false,
}: ImportUpsertKeyBarProps) {
  return (
    <Card
      sx={{
        display:        "flex",
        flexDirection:  { xs: "column", sm: "row" },
        alignItems:     { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap:            1.5,
        px:             2,
        py:             1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: COLORS.textLabelBlack }}>
          Upsert key:
        </Typography>
        <AppSelect
          value={upsertKey}
          onChange={onChange}
          options={options}
          width={140}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        {onEditMapping && (
          <ButtonBase
            onClick={onEditMapping}
            sx={{
              fontSize:     "0.85rem",
              fontWeight:   600,
              color:        COLORS.primary,
              px:           1,
              py:           0.5,
              borderRadius: 1,
              "&:hover":    { bgcolor: COLORS.primarylight },
            }}
          >
            Edit mapping
          </ButtonBase>
        )}

        <Button
          variant="contained"
          onClick={onPreview}
          disabled={previewDisabled}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none",
            fontWeight:    700,
            px:            3,
          }}
        >
          {previewLabel}
        </Button>
      </Box>
    </Card>
  )
}
