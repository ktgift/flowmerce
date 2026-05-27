import type { SxProps, Theme } from "@mui/material/styles"
import Autocomplete from "@mui/material/Autocomplete"
import TextField from "@mui/material/TextField"

import FieldWrapper from "@/components/common/FieldWrapper"

interface AppAutocompleteProps<T> {
  options: T[]
  getOptionLabel: (option: T) => string
  isOptionEqualToValue: (option: T, value: T) => boolean
  value: T | null
  onChange: (value: T | null) => void
  fieldLabel?: string
  placeholder?: string
  noOptionsText?: string
  disabled?: boolean
  sx?: SxProps<Theme>
}

export default function AppAutocomplete<T>({
  options,
  getOptionLabel,
  isOptionEqualToValue,
  value,
  onChange,
  fieldLabel,
  placeholder,
  noOptionsText,
  disabled,
  sx,
}: AppAutocompleteProps<T>) {
  return (
    <FieldWrapper label={fieldLabel}>
      <Autocomplete
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        value={value}
        onChange={(_, val) => onChange(val)}
        size="small"
        disabled={disabled}
        noOptionsText={noOptionsText}
        sx={sx}
        renderInput={(params) => (
          <TextField {...params} placeholder={placeholder} />
        )}
      />
    </FieldWrapper>
  )
}
