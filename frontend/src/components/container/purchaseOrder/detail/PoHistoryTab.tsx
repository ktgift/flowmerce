import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import AppTimeline from "@/components/common/AppTimeline"
import type { TimelineItem } from "@/components/common/AppTimeline"
import SectionCard from "@/components/common/SectionCard"
import type { PoHistoryEntry } from "@/lib/@types/po"
import { COLORS, PO_STATUS_COLORS } from "@/lib/constants/colors"
import {
  PO_STATUS_LABEL,
  PO_HISTORY_ACTION_COLOR,
  PO_HISTORY_ACTION_LABEL,
} from "@/lib/constants/po"
import { formatDateTime } from "@/lib/utils/format"

function getDotColor(entry: PoHistoryEntry): string {
  if (entry.newStatus && PO_STATUS_COLORS[entry.newStatus]) {
    return PO_STATUS_COLORS[entry.newStatus].color
  }
  return PO_HISTORY_ACTION_COLOR[entry.action] ?? COLORS.neutral
}

function buildParts(entry: PoHistoryEntry): { actor: string; action: string } {
  const actor = entry.changedBy ?? "System"

  if (entry.oldStatus && entry.newStatus) {
    const from = PO_STATUS_LABEL[entry.oldStatus] ?? entry.oldStatus
    const to   = PO_STATUS_LABEL[entry.newStatus] ?? entry.newStatus
    return { actor, action: `changed status from ${from} to ${to}` }
  }

  const fn = PO_HISTORY_ACTION_LABEL[entry.action]
  if (fn) {
    const full = fn(actor)
    return { actor, action: full.slice(actor.length + 1) }
  }
  return { actor, action: entry.action }
}

function toTimelineItem(entry: PoHistoryEntry): TimelineItem {
  const { actor, action } = buildParts(entry)
  return {
    id:       entry.id,
    dotColor: getDotColor(entry),
    label: (
      <Typography variant="body2">
        <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
          {actor}
        </Typography>
        {" "}
        {action}
        {entry.note && (
          <Typography component="span" variant="body2" color="text.secondary">
            {" · "}{entry.note}
          </Typography>
        )}
      </Typography>
    ),
    subLabel: (
      <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
        {formatDateTime(entry.createdAt)}
      </Typography>
    ),
  }
}

interface PoHistoryTabProps {
  history: PoHistoryEntry[]
}

export default function PoHistoryTab({ history }: PoHistoryTabProps) {
  return (
    <SectionCard title="History">
      {history.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.disabled">
            No history yet
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2.5, py: 2.5 }}>
          <AppTimeline items={history.map(toTimelineItem)} />
        </Box>
      )}
    </SectionCard>
  )
}
