import type { ReactNode } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import type { SxProps, Theme } from "@mui/material/styles"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

interface SectionCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
  sx?: SxProps<Theme>
}

export default function SectionCard({ title, children, action, sx }: SectionCardProps) {
  return (
    <Card sx={{ height: "100%", ...sx }}>
      <Box
        sx={{
          px: 2.5,
          pt: action ? 2 : 3,
          pb: action ? 1.5 : undefined,
          ...(action && { display: "flex", alignItems: "center", justifyContent: "space-between" }),
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1rem", mb: 1, color: COLORS.textLabelBlack }}>
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Card>
  )
}
