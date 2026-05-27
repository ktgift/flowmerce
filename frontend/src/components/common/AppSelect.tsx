import type { SxProps, Theme } from "@mui/material/styles"
import MenuItem from "@mui/material/MenuItem"
import Select, { type SelectChangeEvent } from "@mui/material/Select"
import Typography from "@mui/material/Typography"

import FieldWrapper from "@/components/common/FieldWrapper"
import { COLORS } from "@/lib/constants/colors"

export interface AppSelectOption {
  value: string
  label: string
}

interface AppSelectProps {
  value: string
  onChange: (value: string) => void
  options: AppSelectOption[]
  fieldLabel?: string
  placeholder?: string
  width?: number | string
  disabled?: boolean
  sx?: SxProps<Theme>
}

export default function AppSelect({
  value,
  onChange,
  options,
  fieldLabel,
  placeholder,
  width,
  disabled,
  sx,
}: AppSelectProps) {
  function handleChange(e: SelectChangeEvent<string>) {
    onChange(e.target.value)
  }

  return (
    <FieldWrapper label={fieldLabel}>
      <Select
        value={value}
        onChange={handleChange}
        size="small"
        displayEmpty
        disabled={disabled}
        sx={[
          width != null ? { width } : {},
          ...(Array.isArray(sx) ? sx : sx != null ? [sx] : []),
        ]}
      >
        {placeholder != null && (
          <MenuItem value="">
            <Typography sx={{ fontSize: "0.85rem", color: COLORS.neutral }}>
              {placeholder}
            </Typography>
          </MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.85rem" }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FieldWrapper>
  )
}
