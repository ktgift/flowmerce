import { Box, Typography } from "@mui/material"
import { useMemo } from "react"

import type { PoSummary, PoStatusSummaryItem } from "@/lib/@types/po"
import { usePoSummary } from "@/lib/api/po.api"
import { PO_SUMMARY_STATUS_ORDER } from "@/lib/constants/po"
import { formatMoneyCompact } from "@/lib/utils/format"
import PoStatusBar from "./PoStatusBar"
import PoStatusCards from "./PoStatusCards"

const MOCK_SUMMARY: PoSummary = {
  byStatus: [
    { status: "draft",            count: 3, totalThb: 1_500_000 },
    { status: "pending_approval", count: 2, totalThb:   820_000 },
    { status: "approved",         count: 5, totalThb: 2_000_000 },
    { status: "sent_to_supplier", count: 4, totalThb: 1_240_000 },
    { status: "partial_received", count: 2, totalThb:   650_000 },
    { status: "received",         count: 1, totalThb:   380_000 },
    { status: "closed",           count: 1, totalThb:   290_000 },
  ],
  openCount:    17,
  openTotalThb: 4_590_000,
}

export default function PoSummaryBanner() {
  const { data: d } = usePoSummary()

  const data = d ?? MOCK_SUMMARY //TODO: remove mock when API is ready

  const orderedItems = useMemo((): PoStatusSummaryItem[] => {
    if (!data) return []
    const map = Object.fromEntries(data.byStatus.map((s) => [s.status, s]))
    return PO_SUMMARY_STATUS_ORDER
      .map((s) => map[s])
      .filter((s): s is PoStatusSummaryItem => !!s && s.count > 0)
  }, [data])

  const total = useMemo(
    () => orderedItems.reduce((acc, s) => acc + s.count, 0),
    [orderedItems],
  )

  if (!data || orderedItems.length === 0) return null

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
        <Typography
          sx={{
            fontSize: { xs: "2rem", md: "2.5rem" },
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {formatMoneyCompact(data.openTotalThb)}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          distributed across {data.openCount} open purchase orders
        </Typography>
      </Box>

      <PoStatusBar   items={orderedItems} total={total} />
      <PoStatusCards items={orderedItems} total={total} />
    </Box>
  )
}
