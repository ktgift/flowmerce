import { type FieldValues, type Path, type Control, useController } from "react-hook-form"
import FormControl from "@mui/material/FormControl"
import FormHelperText from "@mui/material/FormHelperText"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"

interface SelectOption {
  value: string | number
  label: string
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  options: SelectOption[]
  helperText?: string
  disabled?: boolean
  fullWidth?: boolean
  minWidth?: number | string
}

export default function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  helperText,
  disabled,
  fullWidth = true,
  minWidth = 120,
}: FormSelectProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  const labelId = `${name}-label`

  return (
    <FormControl size="small" fullWidth={fullWidth} error={!!error} disabled={disabled} sx={{ minWidth }}>
      <InputLabel id={labelId} sx={{ fontSize: 12 }}>{label}</InputLabel>
      <Select
        {...field}
        labelId={labelId}
        label={label}
        displayEmpty
        renderValue={(value) => {
          if (value === "" || value === undefined || value === null) return <span>&nbsp;</span>
          return options.find((opt) => opt.value === value)?.label ?? String(value)
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {(error?.message ?? helperText) && (
        <FormHelperText>{error?.message ?? helperText}</FormHelperText>
      )}
    </FormControl>
  )
}
