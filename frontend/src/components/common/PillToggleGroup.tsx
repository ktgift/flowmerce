import Box from "@mui/material/Box"
import { COLORS } from "@/lib/constants/colors"

interface PillOption {
  value: string
  label: string
}

interface PillToggleGroupProps {
  options: PillOption[]
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export default function PillToggleGroup({
  options,
  value,
  onChange,
  disabled,
}: PillToggleGroupProps) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <Box
            key={opt.value}
            component="button"
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            sx={{
              px: 2,
              py: 0.75,
              border: selected ? `1.5px solid ${COLORS.primary}` : `1.5px solid ${COLORS.border}`,
              borderRadius: "999px",
              bgcolor: selected ? COLORS.primarylight : COLORS.white,
              color: selected ? COLORS.primary : COLORS.text,
              fontWeight: selected ? 700 : 400,
              fontSize: "0.82rem",
              cursor: disabled ? "default" : "pointer",
              transition: "all 0.15s",
              "&:hover:not(:disabled)": {
                borderColor: COLORS.primary,
                color: COLORS.primary,
              },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            {opt.label}
          </Box>
        )
      })}
    </Box>
  )
}
