import { createContext, useCallback, useContext, useState } from "react"
import type { ReactNode } from "react"
import ModalContainer from "@/components/common/Modal/ModalContainer"
import type { ModalOptions } from "@/lib/@types/ui"

interface ModalState extends ModalOptions {
  open: boolean
}

interface ModalContextValue {
  openModal: (options: ModalOptions) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

const CLOSED_STATE: ModalState = {
  open: false,
  title: "",
  body: <></>,
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>(CLOSED_STATE)

  const openModal = useCallback((options: ModalOptions) => {
    setState({ ...options, open: true })
  }, [])

  const closeModal = useCallback(() => {
    setState(CLOSED_STATE)
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ModalContainer {...state} onClose={closeModal} />
    </ModalContext.Provider>
  )
}

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error("useModalContext must be used inside <ModalProvider>")
  return ctx
}
