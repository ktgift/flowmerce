import { Alert, Snackbar } from "@mui/material"
import { createContext, useCallback, useContext, useState } from "react"
import type { ReactNode } from "react"

type SnackbarSeverity = "success" | "error" | "warning" | "info"

interface SnackbarOptions {
  message:  string
  severity?: SnackbarSeverity
  duration?: number | null
}

interface SnackbarContextValue {
  show:    (options: SnackbarOptions) => void
  success: (message: string, duration?: number | null) => void
  error:   (message: string, duration?: number | null) => void
  warning: (message: string, duration?: number | null) => void
  info:    (message: string, duration?: number | null) => void
}

interface SnackbarState {
  open:     boolean
  message:  string
  severity: SnackbarSeverity
  duration: number | null
}

const DEFAULT_STATE: SnackbarState = {
  open:     false,
  message:  "",
  severity: "info",
  duration: 3000,
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>(DEFAULT_STATE)

  const show = useCallback(({ message, severity = "info", duration }: SnackbarOptions) => {
    setState({ open: true, message, severity, duration: duration === undefined ? 3000 : duration })
  }, [])

  const success = useCallback((message: string, duration?: number | null) => show({ message, severity: "success", duration }), [show])
  const error   = useCallback((message: string, duration?: number | null) => show({ message, severity: "error",   duration }), [show])
  const warning = useCallback((message: string, duration?: number | null) => show({ message, severity: "warning", duration }), [show])
  const info    = useCallback((message: string, duration?: number | null) => show({ message, severity: "info",    duration }), [show])

  const handleClose = useCallback((_: unknown, reason?: string) => {
    if (reason === "clickaway") return
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  return (
    <SnackbarContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={state.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ fontSize: 12, borderRadius: "10px", minWidth: 260 }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useSnackbarContext(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error("useSnackbarContext must be used inside <SnackbarProvider>")
  return ctx
}
