import type { ReactElement, ReactNode } from "react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderConfig {
  title: string
  titleSuffix?: ReactNode
  subtitle?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
}

export interface ModalState {
  open: boolean
}

export interface TableState {
  page: number
  pageSize: number
  sort: { field: string; order: "asc" | "desc" } | null
  filter: Record<string, unknown>
}

export interface DialogProps {
  open: boolean
  onClose: () => void
}

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: "primary" | "error" | "warning" | "success"
}

export interface ModalOptions {
  title: string
  body: ReactElement
  width?: number
  maxHeight?: number
  titleLine?: boolean
  closeOnBackdrop?: boolean
  variant?: "center" | "bottom-sheet"
}
