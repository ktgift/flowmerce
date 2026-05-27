import type { Control } from "react-hook-form"
import Grid from "@mui/material/Grid"

import FormTextField  from "@/components/common/FormTextField"
import FormDatePicker from "@/components/common/FormDatePicker"
import type { ReceiptCreateFormValues } from "@/lib/schema/po.schema"

interface ReceiveHeaderFieldsProps {
  control: Control<ReceiptCreateFormValues>
}

export default function ReceiveHeaderFields({ control }: ReceiveHeaderFieldsProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField
          control={control}
          name="receiptNumber"
          label="Receipt Number"
          required
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormDatePicker
          control={control}
          name="receivedDate"
          label="Received Date"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField
          control={control}
          name="receivedBy"
          label="Received By"
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FormTextField
          control={control}
          name="note"
          label="Note"
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  )
}
