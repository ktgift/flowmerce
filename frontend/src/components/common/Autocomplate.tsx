import { type FieldValues, type Path, type Control, useController } from "react-hook-form"
import Autocomplete from "@mui/material/Autocomplete"
import TextField    from "@mui/material/TextField"
import Avatar       from "@mui/material/Avatar"
import Box          from "@mui/material/Box"
import Typography   from "@mui/material/Typography"

import { COLORS } from "@/lib/constants/colors"

export interface AutocomplateOption {
  value:     string | number
  label:     string
  subtitle?: string
  avatar?:   { initials: string; bgColor: string, color: string }
}

interface AutocomplateProps<T extends FieldValues> {
  control:          Control<T>
  name:             Path<T>
  label:            string
  options:          AutocomplateOption[]
  helperText?:      string
  disabled?:        boolean
  placeholder?:     string
  onOptionChange?:  (option: AutocomplateOption | null) => void
}

export default function Autocomplate<T extends FieldValues>({
  control,
  name,
  label,
  options,
  helperText,
  disabled,
  placeholder,
  onOptionChange,
}: AutocomplateProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  const selected = options.find((o) => o.value === field.value) ?? null

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(o, v) => o.value === v.value}
      value={selected}
      onChange={(_, newVal) => {
        field.onChange(newVal ? newVal.value : null)
        onOptionChange?.(newVal)
      }}
      onBlur={field.onBlur}
      disabled={disabled}
      size="small"
      fullWidth
      renderOption={(props, option) => {
        const { key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>
        return (
          <Box
            key={key}
            component="li"
            {...rest}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, py: "10px !important" }}
          >
            {option.avatar && (
              <Avatar
                sx={{
                  bgcolor:    option.avatar.bgColor ?? COLORS.primarylight,
                  width:      36,
                  height:     36,
                  fontWeight: 700,
                  fontSize:   "0.8rem",
                  flexShrink: 0,
                  color:      option.avatar.color ?? COLORS.white,
                }}
              >
                {option.avatar.initials}
              </Avatar>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.3 }}>
                {option.label}
              </Typography>
              {option.subtitle && (
                <Typography
                  sx={{
                    fontSize:     "0.75rem",
                    color:        COLORS.neutral,
                    whiteSpace:   "nowrap",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    lineHeight:   1.4,
                  }}
                >
                  {option.subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={field.ref}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message ?? helperText}
        />
      )}
    />
  )
}
