import type { TextFieldProps } from "@mui/material/TextField"
import TextField from "@mui/material/TextField"

import FieldWrapper from "@/components/common/FieldWrapper"

type AppTextFieldProps = Omit<TextFieldProps, "size" | "variant"> & {
  fieldLabel?: string
}

export default function AppTextField({ fieldLabel, sx, ...props }: AppTextFieldProps) {
  return (
    <FieldWrapper label={fieldLabel}>
      <TextField
        {...props}
        variant="outlined"
        size="small"
        sx={sx}
      />
    </FieldWrapper>
  )
}
