import { createContext, useCallback, useContext, useRef, useState } from "react"
import type { ReactNode } from "react"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import type { ConfirmOptions } from "@/lib/@types/ui"

interface ConfirmDialogState extends ConfirmOptions {
  open: boolean
  loading: boolean
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

const CLOSED_STATE: ConfirmDialogState = {
  open: false,
  loading: false,
  title: "",
  message: "",
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState>(CLOSED_STATE)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setState({ ...CLOSED_STATE, ...options, open: true })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true)
    resolverRef.current = null
    setState(CLOSED_STATE)
  }, [])

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false)
    resolverRef.current = null
    setState(CLOSED_STATE)
  }, [])

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        confirmColor={state.confirmColor}
        loading={state.loading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialogContext(): ConfirmDialogContextValue {
  const ctx = useContext(ConfirmDialogContext)
  if (!ctx) throw new Error("useConfirmDialogContext must be used inside <ConfirmDialogProvider>")
  return ctx
}
