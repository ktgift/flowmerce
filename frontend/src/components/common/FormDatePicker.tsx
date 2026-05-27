import { type FieldValues, type Path, type Control, useController } from "react-hook-form"
import TextField, { type TextFieldProps } from "@mui/material/TextField"

import FieldWrapper from "@/components/common/FieldWrapper"

type FormDatePickerProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label?: string
  fieldLabel?: string
  helperText?: string
  min?: string
  max?: string
} & Omit<TextFieldProps, "name" | "label" | "type">

export default function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  fieldLabel,
  helperText,
  min,
  max,
  ...rest
}: FormDatePickerProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  return (
    <FieldWrapper label={fieldLabel}>
      <TextField
        {...rest}
        {...field}
        label={label}
        type="date"
        error={!!error}
        helperText={error?.message ?? helperText}
        fullWidth
        size="small"
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min, max },
        }}
      />
    </FieldWrapper>
  )
}
