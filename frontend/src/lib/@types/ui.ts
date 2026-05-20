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
