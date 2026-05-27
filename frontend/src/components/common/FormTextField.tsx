import { type FieldValues, type Path, type Control, useController } from "react-hook-form"
import TextField, { type TextFieldProps } from "@mui/material/TextField"

type FormTextFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  type?: string
  helperText?: string
  multiline?: boolean
  rows?: number
} & Omit<TextFieldProps, "name" | "label" | "type" | "multiline" | "rows">

export default function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  helperText,
  multiline,
  rows,
  ...rest
}: FormTextFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  return (
    <TextField
      {...rest}
      {...field}
      label={label}
      type={type}
      multiline={multiline}
      rows={rows}
      error={!!error}
      helperText={error?.message ?? helperText}
      fullWidth
      size="small"
      sx={rest.sx}
    />
  )
}
