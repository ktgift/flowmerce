import Box from "@mui/material/Box"
import ButtonBase from "@mui/material/ButtonBase"
import Typography from "@mui/material/Typography"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"

import { COLORS } from "@/lib/constants/colors"

interface ImportMatchStatusBannerProps {
  matched:       boolean
  templateName?: string
  detail:        string
  onEdit?:       () => void
  editLabel?:    string
}

export default function ImportMatchStatusBanner({
  matched,
  templateName,
  detail,
  onEdit,
  editLabel = "Edit",
}: ImportMatchStatusBannerProps) {
  const bg     = matched ? COLORS.greenLight   : COLORS.orangeLight
  const accent = matched ? COLORS.greenDark    : COLORS.orangeDark
  const title  = matched
    ? `Template matched: ${templateName ?? ""}`
    : "No matching template found"

  const Icon = matched ? CheckCircleIcon : WarningAmberRoundedIcon

  return (
    <Box
      sx={{
        display:        "flex",
        alignItems:     "flex-start",
        gap:            1.5,
        bgcolor:        bg,
        borderRadius:   2,
        px:             2,
        py:             1.5,
      }}
    >
      <Icon sx={{ fontSize: 22, color: accent, mt: 0.25, flexShrink: 0 }} />

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: accent }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: COLORS.text, mt: 0.25 }}>
          {detail}
        </Typography>
      </Box>

      {onEdit && (
        <ButtonBase
          onClick={onEdit}
          sx={{
            display:      "flex",
            alignItems:   "center",
            gap:          0.5,
            color:        COLORS.primary,
            fontWeight:   600,
            fontSize:     "0.85rem",
            px:           1,
            py:           0.5,
            borderRadius: 1,
            "&:hover":    { bgcolor: COLORS.primarylight },
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 16 }} />
          {editLabel}
        </ButtonBase>
      )}
    </Box>
  )
}
