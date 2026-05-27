import { useEffect, useMemo }             from "react"
import { useController, type Control }    from "react-hook-form"
import Box                                from "@mui/material/Box"
import Typography                         from "@mui/material/Typography"
import Button                             from "@mui/material/Button"
import Avatar                             from "@mui/material/Avatar"
import Grid                               from "@mui/material/Grid"
import SwapHorizIcon                      from "@mui/icons-material/SwapHoriz"

import { COLORS }                         from "@/lib/constants/colors"
import { getInitials }                    from "@/lib/utils/avatar"
import { useSupplierOptions }             from "@/lib/api/supplier.api"
import DetailLabel                        from "@/components/common/DetailLabel"
import Autocomplate, { type AutocomplateOption } from "@/components/common/Autocomplate"
import type { PoCreateFormValues }        from "@/lib/schema/po.schema"
import { SectionCard, SectionTitle }      from "./PoInfoSection"

interface PoSupplierSectionProps {
  control: Control<PoCreateFormValues>
}

export default function PoSupplierSection({ control }: PoSupplierSectionProps) {
  const { field: idField }       = useController({ control, name: "supplierId" })
  const { field: snapshotField } = useController({ control, name: "supplierSnapshot" })

  const supplierId = idField.value as number | undefined
  const snapshot   = snapshotField.value

  const { data: supplierOptions = [] } = useSupplierOptions()

  // edit mode: supplierId มีแต่ยังไม่มี snapshot → หาจาก options ที่โหลดมา
  useEffect(() => {
    if (supplierId && !snapshot && supplierOptions.length > 0) {
      const found = supplierOptions.find((s) => s.id === supplierId)
      if (found) snapshotField.onChange(found)
    }
  }, [supplierId, snapshot, supplierOptions, snapshotField])

  const options = useMemo(
    () =>
      supplierOptions.map((s) => ({
        value:    s.id,
        label:    s.label,
        subtitle: [s.code, s.contactPerson, s.email].filter(Boolean).join(" · "),
        avatar:   { initials: getInitials(s.label), bgColor: COLORS.purpleLight, color: COLORS.secondary },
      })),
    [supplierOptions],
  )

  function handleOptionChange(option: AutocomplateOption | null) {
    const full = option ? supplierOptions.find((s) => s.id === option.value) : null
    snapshotField.onChange(full ?? null)
  }

  function handleChange() {
    idField.onChange(null)
    snapshotField.onChange(null)
  }

  return (
    <SectionCard>
      <SectionTitle>Supplier</SectionTitle>

      {snapshot && supplierId ? (
        <SelectedCard snapshot={snapshot} onChangeSupplier={handleChange} />
      ) : (
        <Autocomplate
          control={control}
          name="supplierId"
          label="Supplier"
          placeholder="Search supplier (name, code, contact)"
          options={options}
          onOptionChange={handleOptionChange}
        />
      )}
    </SectionCard>
  )
}

/* ── Sub-components ── */

type Snapshot = NonNullable<PoCreateFormValues["supplierSnapshot"]>

interface SelectedCardProps {
  snapshot:         Snapshot
  onChangeSupplier: () => void
}

function SelectedCard({ snapshot, onChangeSupplier }: SelectedCardProps) {
  return (
    <Box
      sx={{
        border:       "1px solid",
        borderColor:  COLORS.primarylight,
        bgcolor:      `${COLORS.primarylight}40`,
        borderRadius: 2,
        p:            2.5,
      }}
    >
      <Box
        sx={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          mb:             2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor:    COLORS.purpleLight,
              color:      COLORS.secondary,
              width:      40,
              height:     40,
              fontWeight: 700,
              fontSize:   "0.9rem",
            }}
          >
            {getInitials(snapshot?.label ?? '')}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              {snapshot?.label ?? ''}
            </Typography>
            {snapshot?.code && (
              <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText }}>
                {snapshot?.code}
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          size="small"
          startIcon={<SwapHorizIcon sx={{ fontSize: 15 }} />}
          onClick={onChangeSupplier}
          sx={{ color: COLORS.primary, fontWeight: 600, fontSize: "0.8rem" }}
        >
          Change
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <DetailLabel label="Tax ID"  value={snapshot.taxId}         />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <DetailLabel label="Phone"   value={snapshot.phone}         />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <DetailLabel label="Email"   value={snapshot.email}         />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <DetailLabel label="Contact" value={snapshot.contactPerson} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DetailLabel label="Address" value={snapshot.address}       />
        </Grid>
      </Grid>
    </Box>
  )
}
