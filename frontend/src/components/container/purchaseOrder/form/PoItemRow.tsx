import type { Control, UseFormSetValue } from "react-hook-form"
import { useWatch } from "react-hook-form"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import TableCell from "@mui/material/TableCell"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined"

import { COLORS } from "@/lib/constants/colors"
import type { PoCreateFormValues } from "@/lib/schema/po.schema"
import { calcItemCost } from "@/lib/utils/poCalculations"

interface PoItemRowProps {
  index:        number
  control:      Control<PoCreateFormValues>
  setValue:     UseFormSetValue<PoCreateFormValues>
  exchangeRate: number
  onRemove:     () => void
}

function NumCell({
  value,
  onChange,
  placeholder,
  min = 0,
}: {
  value: number | undefined | ""
  onChange: (v: number | "") => void
  placeholder?: string
  min?: number
}) {
  return (
    <TextField
      type="number"
      size="small"
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value
        onChange(raw === "" ? "" : Number(raw))
      }}
      placeholder={placeholder}
      slotProps={{ htmlInput: { min, style: { textAlign: "right", padding: "4px 6px", fontSize: "0.82rem" } } }}
      sx={{
        width: "100%",
        "& .MuiOutlinedInput-root": {
          bgcolor: COLORS.backgroundDefault,
          "& fieldset": { borderColor: "transparent" },
          "&:hover fieldset":  { borderColor: COLORS.primary },
          "&.Mui-focused fieldset": { borderColor: COLORS.primary },
        },
      }}
    />
  )
}

function ReadCell({ value, prefix = "" }: { value: number; prefix?: string }) {
  return (
    <Box
      sx={{
        px:         1,
        py:         0.5,
        textAlign:  "right",
        fontSize:   "0.82rem",
        fontWeight: 600,
        color:      COLORS.text,
        bgcolor:    COLORS.graylight,
        borderRadius: 1,
        minWidth:   60,
      }}
    >
      {prefix}{isNaN(value) || !isFinite(value) ? "—" : value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
    </Box>
  )
}

export default function PoItemRow({ index, control, setValue, exchangeRate, onRemove }: PoItemRowProps) {
  const item = useWatch({ control, name: `items.${index}` })

  function set(field: keyof PoCreateFormValues["items"][number], v: number | "") {
    setValue(`items.${index}.${field}`, v === "" ? undefined : v)
  }

  const qty = Number(item?.quantity ?? 0)
  const exw = Number(item?.exWorkPrice ?? 0)
  const { cifUsd, cifThb, landed: landedU } = calcItemCost({
    cifUsdPerUnit:        exw + Number(item?.freightCost          ?? 0),
    taxRate:              Number(item?.taxRate                    ?? 0),
    clearingCost:         Number(item?.clearingCost              ?? 0),
    warehouseCostPercent: Number(item?.warehouseCostPercent      ?? 0),
    exchangeRate,
  })

  return (
    <TableRow sx={{ "&:hover": { bgcolor: `${COLORS.primarylight}20` } }}>
      {/* Product name */}
      <TableCell sx={{ minWidth: 160, py: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
            {item?.name || <span style={{ color: COLORS.neutral }}>—</span>}
          </Typography>
          {item?.sku && (
            <Typography sx={{ fontSize: "0.72rem", color: COLORS.subText }}>{item.sku}</Typography>
          )}
        </Box>
      </TableCell>

      {/* QTY */}
      <TableCell sx={{ width: 80, py: 1 }}>
        <NumCell
          value={item?.quantity as number | ""}
          onChange={(v) => set("quantity", v)}
          min={0}
        />
      </TableCell>

      {/* UNIT */}
      <TableCell sx={{ width: 70, py: 1 }}>
        <TextField
          size="small"
          value={item?.unit ?? ""}
          onChange={(e) => setValue(`items.${index}.unit`, e.target.value)}
          slotProps={{ htmlInput: { style: { padding: "4px 6px", fontSize: "0.82rem" } } }}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              bgcolor: COLORS.backgroundDefault,
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: COLORS.primary },
              "&.Mui-focused fieldset": { borderColor: COLORS.primary },
            },
          }}
        />
      </TableCell>

      {/* EXW $ */}
      <TableCell sx={{ width: 90, py: 1 }}>
        <NumCell value={item?.exWorkPrice as number | ""} onChange={(v) => set("exWorkPrice", v)} placeholder="0.00" />
      </TableCell>

      {/* FREIGHT */}
      <TableCell sx={{ width: 80, py: 1 }}>
        <NumCell value={item?.freightCost as number | ""} onChange={(v) => set("freightCost", v)} placeholder="0" />
      </TableCell>

      {/* CIF $ (calculated) */}
      <TableCell sx={{ width: 80, py: 1, textAlign: "right" }}>
        <ReadCell value={cifUsd} prefix="$" />
      </TableCell>

      {/* CIF ฿ (calculated) */}
      <TableCell sx={{ width: 90, py: 1, textAlign: "right" }}>
        <ReadCell value={cifThb} />
      </TableCell>

      {/* TAX % */}
      <TableCell sx={{ width: 70, py: 1 }}>
        <NumCell value={item?.taxRate as number | ""} onChange={(v) => set("taxRate", v)} placeholder="0" />
      </TableCell>

      {/* CLEARING */}
      <TableCell sx={{ width: 90, py: 1 }}>
        <NumCell value={item?.clearingCost as number | ""} onChange={(v) => set("clearingCost", v)} placeholder="0" />
      </TableCell>

      {/* WH % */}
      <TableCell sx={{ width: 70, py: 1 }}>
        <NumCell value={item?.warehouseCostPercent as number | ""} onChange={(v) => set("warehouseCostPercent", v)} placeholder="0" />
      </TableCell>

      {/* LANDED/U (calculated) */}
      <TableCell sx={{ width: 100, py: 1, textAlign: "right" }}>
        <ReadCell value={landedU * qty} />
      </TableCell>

      {/* Remove */}
      <TableCell sx={{ width: 36, py: 1, pr: 1 }}>
        <IconButton size="small" onClick={onRemove} sx={{ color: COLORS.neutral, "&:hover": { color: COLORS.error } }}>
          <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}
