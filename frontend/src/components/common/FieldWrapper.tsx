import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { COLORS } from "@/lib/constants/colors"

interface FieldWrapperProps {
  label?: string
  children: React.ReactNode
}

export default function FieldWrapper({ label, children }: FieldWrapperProps) {
  if (!label) return <>{children}</>

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: COLORS.neutral,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  )
}
