import type { Control } from "react-hook-form"
import { useWatch } from "react-hook-form"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"

import TotalRow from "@/components/common/TotalRow"
import { COLORS } from "@/lib/constants/colors"
import type { PoCreateFormValues } from "@/lib/schema/po.schema"
import { calcItemCost } from "@/lib/utils/poCalculations"

interface PoTotalsSummaryProps {
  control:      Control<PoCreateFormValues>
  exchangeRate: number
}

export default function PoTotalsSummary({ control, exchangeRate }: PoTotalsSummaryProps) {
  const items = useWatch({ control, name: "items" }) ?? []

  let totalExwUsd = 0
  let totalCifThb = 0
  let totalTaxThb = 0
  let totalLanded = 0

  for (const item of items) {
    const qty = Number(item?.quantity ?? 0)
    const exw = Number(item?.exWorkPrice ?? 0)
    const { cifThb, taxThb, landed } = calcItemCost({
      cifUsdPerUnit:        exw + Number(item?.freightCost          ?? 0),
      taxRate:              Number(item?.taxRate                    ?? 0),
      clearingCost:         Number(item?.clearingCost              ?? 0),
      warehouseCostPercent: Number(item?.warehouseCostPercent      ?? 0),
      exchangeRate,
    })
    totalExwUsd += exw    * qty
    totalCifThb += cifThb * qty
    totalTaxThb += taxThb * qty
    totalLanded += landed * qty
  }

  if (items.length === 0) return null

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
      <Box
        sx={{
          border:       "1px solid",
          borderColor:  COLORS.border,
          borderRadius: 2,
          px:           3,
          py:           2,
          minWidth:     280,
          bgcolor:      "background.paper",
        }}
      >
        <TotalRow label="Total EXW (USD)"    value={totalExwUsd} prefix="$" />
        <TotalRow label="Total CIF (THB)"    value={totalCifThb} />
        <TotalRow label="Total Tax (THB)"    value={totalTaxThb} />
        <Divider sx={{ my: 1 }} />
        <TotalRow label="Total Landed (THB)" value={totalLanded} bold />
      </Box>
    </Box>
  )
}
