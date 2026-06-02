import type { Control } from "react-hook-form"
import Box      from "@mui/material/Box"
import Chip     from "@mui/material/Chip"
import Grid     from "@mui/material/Grid"
import Typography from "@mui/material/Typography"

import Card           from "@/components/common/Card"
import FormDatePicker  from "@/components/common/FormDatePicker"
import FormNumberField from "@/components/common/FormNumberField"
import FormTextField   from "@/components/common/FormTextField"
import { COLORS }      from "@/lib/constants/colors"
import type { ReceiptCreateFormValues } from "@/lib/schema/po.schema"
import type { ReceiveItem } from "@/lib/@types/po"

interface ReceiveItemRowProps {
  control: Control<ReceiptCreateFormValues>
  index:   number
  item:    ReceiveItem
}

export default function ReceiveItemRow({ control, index, item }: ReceiveItemRowProps) {
  const alreadyReceived = item.quantity - item.remainingQty

  return (
    <Card sx={{ p: 2, mb: 1.5 }}>
      {/* Item header */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textLabelBlack }}>
          {item.name}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
          {item.sku && (
            <Typography variant="caption" color="text.secondary">
              SKU: {item.sku}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            Ordered: {item.quantity}{item.unit ? ` ${item.unit}` : ""}
          </Typography>

          {alreadyReceived > 0 && (
            <Typography variant="caption" color="text.secondary">
              Received: {alreadyReceived}
            </Typography>
          )}

          <Chip
            label={`Remaining: ${item.remainingQty}`}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.7rem",
              bgcolor: COLORS.orangeLight,
              color:   COLORS.orangeDark,
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {/* Form fields */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FormNumberField
            control={control}
            name={`items.${index}.quantityReceived`}
            label="Qty to Receive"
            min={0}
            max={item.remainingQty}
            step={1}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <FormTextField
            control={control}
            name={`items.${index}.lotNumber`}
            label="Lot Number"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <FormDatePicker
            control={control}
            name={`items.${index}.lotExpirationDate`}
            label="Lot Expiry"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <FormTextField
            control={control}
            name={`items.${index}.location`}
            label="Location"
          />
        </Grid>
      </Grid>
    </Card>
  )
}
