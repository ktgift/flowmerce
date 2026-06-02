import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"

import Card from "@/components/common/Card"
import DetailLabel from "@/components/common/DetailLabel"
import type { PoDetail } from "@/lib/@types/po"
import { formatDate, formatMoney } from "@/lib/utils/format"
import PoStatusTimeline from "./PoStatusTimeline"

interface PoOverviewTabProps {
  po: PoDetail
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  )
}

export default function PoOverviewTab({ po }: PoOverviewTabProps) {
  const subTotalUSD = po.items.reduce(
    (sum, item) => sum + (item.cifPrice ?? 0) * item.quantity,
    0,
  )
  const taxTHB = po.items.reduce(
    (sum, item) => sum + (item.taxRate ?? 0) * item.quantity,
    0,
  )
  const clearingTHB = po.items.reduce(
    (sum, item) => sum + (item.clearingCost ?? 0) * item.quantity,
    0,
  )

  return (
    <Box>
      <PoStatusTimeline currentStatus={po.status} history={po.history} />

      <Grid container spacing={2}>
        {/* Info card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailLabel label="Supplier"      value={po.supplierName} />
                <Box sx={{ mt: 1.5 }}>
                  <DetailLabel label="Currency"      value={po.currency} />
                </Box>
                <Box sx={{ mt: 1.5 }}>
                  <DetailLabel label="Exchange Rate" value={po.exchangeRate ? String(po.exchangeRate) : null} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailLabel label="Payment Terms"  value={po.paymentTerm} />
                <Box sx={{ mt: 1.5 }}>
                  <DetailLabel label="Delivery Terms" value={po.deliveryTerm} />
                </Box>
                <Box sx={{ mt: 1.5 }}>
                  <DetailLabel label="Created By"    value={po.createdBy} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailLabel label="Expected Date" value={formatDate(po.expectedDate)} />
                <Box sx={{ mt: 1.5 }}>
                  <DetailLabel label="Created At"   value={formatDate(po.createdAt)} />
                </Box>
                {po.remark && (
                  <Box sx={{ mt: 1.5 }}>
                    <DetailLabel label="Remark" value={po.remark} />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Summary card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", letterSpacing: "0.05em" }}>
              Summary
            </Typography>

            <Box sx={{ mt: 1.5 }}>
              <SummaryRow label={`Subtotal (${po.currency})`} value={formatMoney(subTotalUSD, po.currency)} />
              <SummaryRow label="Tax (THB)"                   value={formatMoney(taxTHB, "THB")} />
              <SummaryRow label="Clearing"                    value={formatMoney(clearingTHB, "THB")} />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Total Landed (THB)
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                {formatMoney(po.totalAmount, "THB")}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
