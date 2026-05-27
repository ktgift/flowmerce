import type { Control, UseFormSetValue } from "react-hook-form"
import { useWatch } from "react-hook-form"
import Grid from "@mui/material/Grid"
import AppTextfield from "@/components/common/AppTextField"
import PillToggleGroup from "@/components/common/PillToggleGroup"
import TermRow         from "@/components/common/TermRow"
import {
  PO_DELIVERY_TERMS,
  PO_PAYMENT_TERMS,
  PO_SHIPPING_METHODS,
} from "@/lib/constants/po"
import type { PoCreateFormValues } from "@/lib/schema/po.schema"
import { SectionCard, SectionTitle } from "./PoInfoSection"

const DELIVERY_OPTIONS = PO_DELIVERY_TERMS.map((v) => ({ value: v, label: v }))
const PAYMENT_OPTIONS  = PO_PAYMENT_TERMS.map((v) => ({ value: v, label: v }))
const SHIPPING_OPTIONS = PO_SHIPPING_METHODS.map((m) => ({ value: m.value, label: `${m.emoji} ${m.value}` }))

interface PoTermsSectionProps {
  control:  Control<PoCreateFormValues>
  setValue: UseFormSetValue<PoCreateFormValues>
}

export default function PoTermsSection({ control, setValue }: PoTermsSectionProps) {
  const deliveryTerm   = useWatch({ control, name: "deliveryTerm" })
  const paymentTerm    = useWatch({ control, name: "paymentTerm" })
  const shippingMethod = useWatch({ control, name: "shippingMethod" })
  const remark         = useWatch({ control, name: "remark" })

  return (
    <SectionCard>
      <SectionTitle>Terms & Conditions</SectionTitle>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TermRow label="Delivery Terms">
            <PillToggleGroup
              options={DELIVERY_OPTIONS}
              value={deliveryTerm}
              onChange={(v) => setValue("deliveryTerm", v)}
            />
          </TermRow>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TermRow label="Payment Terms">
            <PillToggleGroup
              options={PAYMENT_OPTIONS}
              value={paymentTerm}
              onChange={(v) => setValue("paymentTerm", v)}
            />
          </TermRow>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TermRow label="Shipping Method">
            <PillToggleGroup
              options={SHIPPING_OPTIONS}
              value={shippingMethod}
              onChange={(v) => setValue("shippingMethod", v)}
            />
          </TermRow>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TermRow label="Internal Notes">
            <AppTextfield
              // fieldLabel=""
              fullWidth
              multiline
              rows={3}
              placeholder="Internal notes (not visible to supplier)"
              value={remark ?? ""}
              onChange={(e) => setValue("remark", e.target.value)}
            />
          </TermRow>
        </Grid>
      </Grid>
    </SectionCard>
  )
}
