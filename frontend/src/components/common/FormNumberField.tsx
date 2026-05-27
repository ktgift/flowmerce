import { type FieldValues, type Path, type Control, useController } from "react-hook-form"
import TextField, { type TextFieldProps } from "@mui/material/TextField"

import FieldWrapper from "@/components/common/FieldWrapper"

type FormNumberFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label?: string
  fieldLabel?: string
  helperText?: string
  min?: number
  max?: number
  step?: number
} & Omit<TextFieldProps, "name" | "label" | "type">

export default function FormNumberField<T extends FieldValues>({
  control,
  name,
  label,
  fieldLabel,
  helperText,
  min,
  max,
  step,
  ...rest
}: FormNumberFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  return (
    <FieldWrapper label={fieldLabel}>
      <TextField
        {...rest}
        label={label}
        type="number"
        value={field.value ?? ""}
        onChange={(e) => {
          const raw = e.target.value
          field.onChange(raw === "" ? "" : Number(raw))
        }}
        onBlur={field.onBlur}
        inputRef={field.ref}
        error={!!error}
        helperText={error?.message ?? helperText}
        fullWidth
        size="small"
        slotProps={{ htmlInput: { min, max, step } }}
      />
    </FieldWrapper>
  )
}
