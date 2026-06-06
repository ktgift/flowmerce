import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import ButtonBase from "@mui/material/ButtonBase"
import Typography from "@mui/material/Typography"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

interface ImportStepFooterProps {
  onBack?:        () => void
  backLabel?:     string
  continueLabel?: string
  onContinue:     () => void
  disabled?:      boolean
  hint?:          string
}

export default function ImportStepFooter({
  onBack,
  backLabel     = "Back",
  continueLabel = "Continue",
  onContinue,
  disabled,
  hint,
}: ImportStepFooterProps) {
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        {onBack && (
          <ButtonBase
            onClick={onBack}
            sx={{
              fontSize:     "0.85rem",
              fontWeight:   600,
              color:        COLORS.subText,
              px:           1,
              py:           0.5,
              borderRadius: 1,
              "&:hover":    { bgcolor: COLORS.pillBg, color: COLORS.text },
            }}
          >
            ← {backLabel}
          </ButtonBase>
        )}
        {hint && (
          <Typography
            sx={{
              fontSize:     "0.82rem",
              color:        COLORS.subText,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {hint}
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        onClick={onContinue}
        disabled={disabled}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
        sx={{
          textTransform: "none",
          fontWeight:    700,
          px:            3,
        }}
      >
        {continueLabel}
      </Button>
    </Card>
  )
}
