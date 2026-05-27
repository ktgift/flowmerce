import Box from "@mui/material/Box"
import Radio from "@mui/material/Radio"
import Typography from "@mui/material/Typography"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import EditNoteIcon from "@mui/icons-material/EditNote"

import type { PoStatus } from "@/lib/@types/po"
import { COLORS, PO_STATUS_COLORS } from "@/lib/constants/colors"
import {
  PO_MANUAL_STATUSES,
  PO_STATUS_DESCRIPTION,
  PO_STATUS_LABEL,
} from "@/lib/constants/po"

function SectionLabel({ children }: { children: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
      <EditNoteIcon sx={{ fontSize: 15, color: "text.secondary" }} />
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

interface ManualItemProps {
  status:     PoStatus
  isCurrent:  boolean
  isEnabled:  boolean
  isSelected: boolean
  onSelect:   () => void
}

function ManualItem({
  status,
  isCurrent,
  isEnabled,
  isSelected,
  onSelect,
}: ManualItemProps) {
  const colorCfg    = PO_STATUS_COLORS[status as keyof typeof PO_STATUS_COLORS]
  const bgColor     = colorCfg?.bg ?? "#f5f5f5"
  const dotColor    = colorCfg?.color ?? COLORS.grayMedium
  const canInteract = isEnabled && !isCurrent

  return (
    <Box
      onClick={canInteract ? onSelect : undefined}
      sx={{
        display:      "flex",
        gap:          1,
        py:           1.25,
        px:           1.5,
        borderRadius: 2,
        alignItems:   "flex-start",
        cursor:       canInteract ? "pointer" : "default",
        opacity:      isEnabled ? 1 : 0.28,
        bgcolor:      isSelected ? bgColor : isCurrent ? `${dotColor}18` : "transparent",
        border:       "1.5px solid",
        borderColor:  isSelected ? dotColor : "transparent",
        transition:   "background-color 0.15s ease, border-color 0.15s ease",
        "&:hover":    canInteract ? { bgcolor: bgColor, borderColor: dotColor } : {},
        mb:           0.5,
      }}
    >
      <Radio
        checked={isSelected || isCurrent}
        onChange={() => { if (canInteract) onSelect() }}
        size="small"
        sx={{
          p:               0,
          mt:              "2px",
          flexShrink:      0,
          color:           dotColor,
          "&.Mui-checked": { color: dotColor },
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Box
            sx={{
              width:        10,
              height:       10,
              borderRadius: "50%",
              bgcolor:      dotColor,
              flexShrink:   0,
              mt:           "2px",
            }}
          />
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

interface PoStatusManualSectionProps {
  currentStatus: PoStatus
  validNext:     PoStatus[]
  selected:      PoStatus | null
  onSelect:      (s: PoStatus) => void
}

export default function PoStatusManualSection({
  currentStatus,
  validNext,
  selected,
  onSelect,
}: PoStatusManualSectionProps) {
  return (
    <Box>
      <SectionLabel>Update manually</SectionLabel>
      {PO_MANUAL_STATUSES.map((s) => (
        <ManualItem
          key={s}
          status={s}
          isCurrent={s === currentStatus}
          isEnabled={validNext.includes(s) || s === currentStatus}
          isSelected={selected === s}
          onSelect={() => onSelect(s)}
        />
      ))}
    </Box>
  )
}
