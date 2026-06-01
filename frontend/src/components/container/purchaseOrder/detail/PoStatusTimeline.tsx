import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import CheckIcon from "@mui/icons-material/Check"

import type { PoStatus } from "@/lib/@types/po"
import type { PoHistoryEntry } from "@/lib/@types/po"
import { PO_TIMELINE_STEPS } from "@/lib/constants/po"
import { formatDate } from "@/lib/utils/format"
import { COLORS } from "@/lib/constants/colors"

interface PoStatusTimelineProps {
  currentStatus: PoStatus
  history: PoHistoryEntry[]
}

function getStepIndex(status: PoStatus): number {
  return PO_TIMELINE_STEPS.findIndex((s) => s.status === status)
}

function getStatusDate(status: PoStatus, history: PoHistoryEntry[]): string | null {
  if (status === "draft") {
    const entry = history.find((h) => h.action === "created" || h.oldStatus === null)
    return entry?.createdAt ?? null
  }
  const entry = history.find((h) => h.newStatus === status)
  return entry?.createdAt ?? null
}

export default function PoStatusTimeline({
  currentStatus,
  history,
}: PoStatusTimelineProps) {
  const activeIndex = getStepIndex(currentStatus)
  const isCancelledOrRejected = currentStatus === "cancelled"

  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, mb: 2.5, overflowX: "auto" }}
    >
      <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1rem", mb: 2, color: COLORS.textLabelBlack }}>
        Status Timeline
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          minWidth: 560,
          position: "relative",
        }}
      >
        {PO_TIMELINE_STEPS.map((step, i) => {
          const isCompleted = !isCancelledOrRejected && i < activeIndex
          const isActive    = !isCancelledOrRejected && i === activeIndex
          const date        = getStatusDate(step.status, history)

          return (
            <Box
              key={step.status}
              sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
            >
              {/* Connector line */}
              {i > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: "-50%",
                    right: "50%",
                    height: 3,
                    bgcolor: isCompleted || isActive ? "success.main" : "grey.300",
                    zIndex: 0,
                  }}
                />
              )}

              {/* Circle */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  bgcolor: isCompleted
                    ? "success.main"
                    : isActive
                      ? COLORS.primary
                      : "grey.300",
                  color: isCompleted || isActive ? "#fff" : "grey.500",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                {isCompleted ? <CheckIcon sx={{ fontSize: 16 }} /> : i + 1}
              </Box>

              {/* Label */}
              <Typography
                variant="caption"
                sx={{
                  mt: 0.75,
                  fontWeight: isActive ? 700 : 500,
                  color: isCompleted || isActive ? "text.primary" : "text.disabled",
                  textAlign: "center",
                }}
              >
                {step.label}
              </Typography>

              {/* Date */}
              <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center" }}>
                {date ? formatDate(date) : "—"}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}