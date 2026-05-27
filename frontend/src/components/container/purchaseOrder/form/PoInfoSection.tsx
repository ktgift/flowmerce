import type { Control } from "react-hook-form"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"

import AppTextField from "@/components/common/AppTextField"
import FormDatePicker   from "@/components/common/FormDatePicker"
import FormNumberField  from "@/components/common/FormNumberField"
import type { PoCreateFormValues } from "@/lib/schema/po.schema"
import { COLORS } from "@/lib/constants/colors"

interface PoInfoSectionProps {
  control:   Control<PoCreateFormValues>
  poNumber:  string | null
  issueDate: string
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor:      "background.paper",
        borderRadius: 2,
        border:       "1px solid",
        borderColor:  COLORS.border,
        p:            { xs: 2, md: 3 },
      }}
    >
      {children}
    </Box>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
      <Box sx={{ width: 3, height: 18, bgcolor: COLORS.primary, borderRadius: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
        {children}
      </Typography>
    </Box>
  )
}

export { SectionCard, SectionTitle }

export default function PoInfoSection({ control, poNumber, issueDate }: PoInfoSectionProps) {
  return (
    <SectionCard>
      <SectionTitle>PO Information</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AppTextField
            fieldLabel="PO Number"
            value={poNumber ?? "Auto-generated"}
            disabled
            fullWidth
            sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: COLORS.neutral } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AppTextField
            fieldLabel="Issue Date"
            value={issueDate}
            disabled
            fullWidth
            sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: COLORS.neutral } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormDatePicker
            control={control}
            name="expectedDate"
            fieldLabel="Expected Delivery *"
            min={new Date().toISOString().split("T")[0]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormNumberField
            control={control}
            name="exchangeRate"
            fieldLabel="Exchange Rate (THB/USD)"
            step={0.01}
            min={0}
          />
        </Grid>
      </Grid>
    </SectionCard>
  )
}
