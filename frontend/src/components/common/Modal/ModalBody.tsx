import Box from "@mui/material/Box"
import type { ReactNode } from "react"

interface ModalBodyProps {
  children: ReactNode
}

export default function ModalBody({ children }: ModalBodyProps) {
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        px: 3,
        py: 2,
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "grey.300" },
      }}
    >
      {children}
    </Box>
  )
}
