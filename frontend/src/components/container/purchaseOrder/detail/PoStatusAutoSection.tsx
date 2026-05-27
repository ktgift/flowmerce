import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AutorenewIcon from "@mui/icons-material/Autorenew"

import type { PoStatus } from "@/lib/@types/po"
import { COLORS, PO_STATUS_COLORS } from "@/lib/constants/colors"
import {
  PO_AUTO_STATUSES,
  PO_STATUS_DESCRIPTION,
  PO_STATUS_LABEL,
} from "@/lib/constants/po"

function SectionLabel({ children }: { children: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
      <AutorenewIcon sx={{ fontSize: 14, color: "text.secondary" }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 700 }}
      >
        {children}
      </Typography>
    </Box>
  )
}

interface AutoItemProps {
  status:    PoStatus
  isCurrent: boolean
}

function AutoItem({ status, isCurrent }: AutoItemProps) {
  const colorCfg = PO_STATUS_COLORS[status as keyof typeof PO_STATUS_COLORS]
  const dotColor = colorCfg?.color ?? COLORS.grayMedium

  return (
    <Box
      sx={{
        display:      "flex",
        gap:          1.5,
        py:           1.25,
        px:           1.5,
        borderRadius: 2,
        alignItems:   "flex-start",
        bgcolor:      isCurrent ? `${dotColor}18` : "transparent",
        opacity:      isCurrent ? 1 : 0.45,
        mb:           0.5,
      }}
    >
      <Box
        sx={{
          width:        10,
          height:       10,
          borderRadius: "50%",
          bgcolor:      dotColor,
          flexShrink:   0,
          mt:           "5px",
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
            {PO_STATUS_LABEL[status]}
          </Typography>
          {isCurrent && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <CheckCircleIcon sx={{ fontSize: 13, color: "success.main" }} />
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                Current
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.3, lineHeight: 1.5, fontSize: "0.8rem" }}
        >
          {PO_STATUS_DESCRIPTION[status]}
        </Typography>
      </Box>
    </Box>
  )
}

interface PoStatusAutoSectionProps {
  currentStatus: PoStatus
}

export default function PoStatusAutoSection({ currentStatus }: PoStatusAutoSectionProps) {
  return (
    <Box>
      <SectionLabel>Set automatically by the system</SectionLabel>
      {PO_AUTO_STATUSES.map((s) => (
        <AutoItem key={s} status={s} isCurrent={s === currentStatus} />
      ))}
      <Divider sx={{ mt: 2 }} />
    </Box>
  )
}
