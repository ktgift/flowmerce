import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined"
import AddIcon from "@mui/icons-material/Add"

import EmptyState from "@/components/common/EmptyState"
import SectionCard from "@/components/common/SectionCard"
import type { Receipt } from "@/lib/@types/po"
import { formatDate } from "@/lib/utils/format"

interface PoReceiptsTabProps {
  receipts: Receipt[]
  onReceive: () => void
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {receipt.receiptNumber}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(receipt.receivedDate)}
        </Typography>
      </Box>

      {receipt.receivedBy && (
        <Typography variant="caption" color="text.secondary">
          Received by {receipt.receivedBy}
        </Typography>
      )}

      <Divider sx={{ my: 1 }} />

      {(receipt.items ?? []).map((ri) => (
        <Box key={ri.id} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption">Item #{ri.poItemId}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Qty: {ri.quantityReceived}
          </Typography>
          {ri.lotNumber && (
            <Typography variant="caption" color="text.secondary">
              Lot: {ri.lotNumber}
            </Typography>
          )}
        </Box>
      ))}

      {receipt.note && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Note: {receipt.note}
        </Typography>
      )}
    </Paper>
  )
}

export default function PoReceiptsTab({ receipts, onReceive }: PoReceiptsTabProps) {
  return (
    <SectionCard
      title="Goods Receipts"
      action={
        <Button
          variant="text"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={onReceive}
          sx={{ textTransform: "none", fontWeight: 500, color: "primary.main" }}
        >
          Add Receipt
        </Button>
      }
    >
      <Box sx={{ px: 2.5, py: 2 }}>
        {receipts.length === 0 ? (
          <EmptyState
            icon={<ShoppingCartOutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />}
            message="No Goods Receipts"
          />
        ) : (
          receipts.map((r) => <ReceiptCard key={r.id} receipt={r} />)
        )}
      </Box>
    </SectionCard>
  )
}