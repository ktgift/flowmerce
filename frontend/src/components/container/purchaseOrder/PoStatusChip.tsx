import type { PoStatus } from "@/lib/@types/po"
import { PO_STATUS_COLORS } from "@/lib/constants/colors"
import { PO_STATUS_LABEL } from "@/lib/constants/po"
import StatusBadge from "@/components/common/StatusBadge"

interface PoStatusChipProps {
  status:   PoStatus
  onClick?: () => void
}

export default function PoStatusChip({ status, onClick }: PoStatusChipProps) {
  const cfg = PO_STATUS_COLORS[status] ?? { bg: "#e0e0e0", color: "#616161" }
  return (
    <StatusBadge
      status={status}
      backgroundColor={cfg.bg}
      color={cfg.color}
      labelMap={PO_STATUS_LABEL}
      onClick={onClick}
    />
  )
}
