import type { ReactNode } from "react"
import Paper, { type PaperProps } from "@mui/material/Paper"

interface CardProps extends Omit<PaperProps, "children"> {
  children?: ReactNode
}

export default function Card({
  children,
  sx,
  variant = "outlined",
  ...rest
}: CardProps) {
  return (
    <Paper
      variant={variant}
      sx={[{ borderRadius: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...rest}
    >
      {children}
    </Paper>
  )
}
