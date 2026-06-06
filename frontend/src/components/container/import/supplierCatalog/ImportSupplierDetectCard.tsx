import { useEffect, useMemo } from "react"
import Box from "@mui/material/Box"
import Radio from "@mui/material/Radio"
import Typography from "@mui/material/Typography"

import AppSelect, { type AppSelectOption } from "@/components/common/AppSelect"
import AppTextField from "@/components/common/AppTextField"
import { COLORS } from "@/lib/constants/colors"
import { useSupplierOptions } from "@/lib/api/supplier.api"
import {
  detectSupplierNameFromFilename,
  findSupplierMatch,
} from "@/lib/utils/importDetect"
import type { SupplierOption } from "@/lib/@types/supplier"

interface ImportSupplierDetectCardProps {
  filename:        string
  supplierId:      number | null
  supplierNewName: string | null
  rowCount?:       number
  onPickExisting:  (id: number) => void
  onPickNew:       (name: string) => void
}

type Choice = "existing" | "new"

export default function ImportSupplierDetectCard({
  filename,
  supplierId,
  supplierNewName,
  rowCount,
  onPickExisting,
  onPickNew,
}: ImportSupplierDetectCardProps) {
  const { data: suppliers = [], isLoading } = useSupplierOptions()

  const guess       = useMemo(() => detectSupplierNameFromFilename(filename), [filename])
  const autoMatched = useMemo(
    () => (guess ? findSupplierMatch(guess, suppliers) : null),
    [guess, suppliers],
  )

  const selectedSupplier: SupplierOption | null = useMemo(
    () => suppliers.find((s) => s.id === supplierId) ?? null,
    [suppliers, supplierId],
  )

  const choice: Choice = supplierNewName !== null ? "new" : "existing"

  useEffect(() => {
    if (!autoMatched) return
    if (supplierId !== null || supplierNewName !== null) return
    onPickExisting(autoMatched.id)
  }, [autoMatched, supplierId, supplierNewName, onPickExisting])

  const supplierOptions: AppSelectOption[] = suppliers.map((s) => ({
    value: String(s.id),
    label: s.label,
  }))

  function handleChooseExisting() {
    if (autoMatched && supplierId === null) onPickExisting(autoMatched.id)
    else if (selectedSupplier) onPickExisting(selectedSupplier.id)
  }

  function handleChooseNew() {
    const seeded = supplierNewName ?? guess ?? ""
    onPickNew(seeded)
  }

  const attachHint = selectedSupplier
    ? `${rowCount?.toLocaleString() ?? "—"} rows will be attached to ${selectedSupplier.code ?? `supplier #${selectedSupplier.id}`}`
    : null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        onClick={handleChooseExisting}
        sx={{
          display:      "flex",
          alignItems:   "flex-start",
          gap:          1,
          p:            1.75,
          border:       "1.5px solid",
          borderColor:  choice === "existing" ? COLORS.primary : COLORS.border,
          borderRadius: 2,
          bgcolor:      choice === "existing" ? COLORS.primarylight : COLORS.white,
          cursor:       "pointer",
          transition:   "all 0.15s",
          "&:hover":    { borderColor: COLORS.primary },
        }}
      >
        <Radio
          checked={choice === "existing"}
          size="small"
          sx={{ p: 0.5, mt: 0.25, color: COLORS.neutral, "&.Mui-checked": { color: COLORS.primary } }}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: COLORS.textLabelBlack, mb: 1 }}>
            Use an existing supplier
          </Typography>
          <AppSelect
            value={selectedSupplier ? String(selectedSupplier.id) : ""}
            onChange={(val) => val && onPickExisting(Number(val))}
            options={supplierOptions}
            placeholder={isLoading ? "Loading suppliers..." : "Select a supplier"}
            sx={{ width: "100%", bgcolor: COLORS.white }}
          />
          {attachHint && choice === "existing" && (
            <Typography sx={{ fontSize: "0.75rem", color: COLORS.subText, mt: 0.75 }}>
              {attachHint}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        onClick={handleChooseNew}
        sx={{
          display:      "flex",
          alignItems:   "flex-start",
          gap:          1,
          p:            1.75,
          border:       "1.5px solid",
          borderColor:  choice === "new" ? COLORS.primary : COLORS.border,
          borderRadius: 2,
          bgcolor:      choice === "new" ? COLORS.primarylight : COLORS.white,
          cursor:       "pointer",
          transition:   "all 0.15s",
          "&:hover":    { borderColor: COLORS.primary },
        }}
      >
        <Radio
          checked={choice === "new"}
          size="small"
          sx={{ p: 0.5, mt: 0.25, color: COLORS.neutral, "&.Mui-checked": { color: COLORS.primary } }}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
            Create a new supplier
            {guess && choice !== "new" && (
              <Typography
                component="span"
                sx={{ ml: 0.75, fontSize: "0.82rem", color: COLORS.subText, fontWeight: 500 }}
              >
                from "{guess}"
              </Typography>
            )}
          </Typography>
          {choice === "new" && (
            <Box sx={{ mt: 1 }}>
              <AppTextField
                value={supplierNewName ?? ""}
                onChange={(e) => onPickNew(e.target.value)}
                placeholder="Supplier name"
                fullWidth
                sx={{ bgcolor: COLORS.white }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
