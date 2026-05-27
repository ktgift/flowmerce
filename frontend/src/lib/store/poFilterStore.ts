import { create } from "zustand"

import type { PoStatus } from "@/lib/@types/po"

interface PoFilterState {
  status:            PoStatus | ""
  supplierId:        number | null
  search:            string
  pendingSearch:     string
  pendingSupplierId: number | null
  pendingStatus:     PoStatus | ""

  setPendingSearch:     (v: string) => void
  setPendingSupplierId: (v: number | null) => void
  setPendingStatus:     (v: PoStatus | "") => void
  applySearch:          () => void
  clearSearch:          () => void
}

export const usePoFilterStore = create<PoFilterState>((set, get) => ({
  status:            "",
  supplierId:        null,
  search:            "",
  pendingSearch:     "",
  pendingSupplierId: null,
  pendingStatus:     "",

  setPendingSearch:     (v) => set({ pendingSearch: v }),
  setPendingSupplierId: (v) => set({ pendingSupplierId: v }),
  setPendingStatus:     (v) => set({ pendingStatus: v }),

  applySearch: () => {
    const { pendingSearch, pendingSupplierId, pendingStatus } = get()
    set({ search: pendingSearch, supplierId: pendingSupplierId, status: pendingStatus })
  },

  clearSearch: () =>
    set({
      search:            "",
      supplierId:        null,
      pendingSearch:     "",
      pendingSupplierId: null,
      status:            "",
      pendingStatus:     "",
    }),
}))
