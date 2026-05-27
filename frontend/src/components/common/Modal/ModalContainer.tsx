import { useEffect } from "react"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import type { ModalOptions } from "@/lib/@types/ui"
import ModalBody from "./ModalBody"
import ModalHeader from "./ModalHeader"

interface ModalContainerProps extends ModalOptions {
  open: boolean
  onClose: () => void
}

export default function ModalContainer({
  open,
  title,
  body,
  width = 560,
  maxHeight = 80,
  titleLine,
  closeOnBackdrop = true,
  variant = "center",
  onClose,
}: ModalContainerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const isBottomSheet = variant === "bottom-sheet"

  return (
    <Box
      sx={{
        position:        "fixed",
        inset:           0,
        zIndex:          10000,
        display:         "flex",
        alignItems:      isBottomSheet ? "flex-end" : "center",
        justifyContent:  "center",
        px:              isBottomSheet ? 0 : { xs: 2, sm: 0 },
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={closeOnBackdrop ? onClose : undefined}
        sx={{
          position:        "absolute",
          inset:           0,
          backdropFilter:  "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.4)",
          cursor:          closeOnBackdrop ? "pointer" : "default",
        }}
      />

      {/* Modal card */}
      <Paper
        elevation={8}
        onClick={(e) => e.stopPropagation()}
        sx={
          isBottomSheet
            ? {
                position:      "relative",
                zIndex:        1,
                width:         "100%",
                maxWidth:      { xs: "100%", sm: "520px" },
                maxHeight:     "88vh",
                display:       "flex",
                flexDirection: "column",
                overflow:      "hidden",
                borderRadius:  "24px 24px 0 0",
                boxShadow:     "0 -4px 40px rgba(0,0,0,0.14)",
                "@keyframes slideUp": {
                  "0%":   { transform: "translateY(100%)" },
                  "100%": { transform: "translateY(0)" },
                },
                animation: "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
              }
            : {
                position:      "relative",
                zIndex:        1,
                width:         { xs: "100%", sm: `min(${width}px, calc(100vw - 48px))` },
                maxWidth:      "100%",
                maxHeight:     { xs: "90vh", sm: `${maxHeight}vh` },
                display:       "flex",
                flexDirection: "column",
                borderRadius:  2,
                overflow:      "hidden",
              }
        }
      >
        {isBottomSheet ? (
          body
        ) : (
          <>
            <ModalHeader title={title} titleLine={titleLine} onClose={onClose} />
            <ModalBody>{body}</ModalBody>
          </>
        )}
      </Paper>
    </Box>
  )
}
