import { create } from "zustand"

interface LoaderState {
  requestCount: number
  isLoading:    boolean
  inc: () => void
  dec: () => void
}

export const useLoaderStore = create<LoaderState>((set) => ({
  requestCount: 0,
  isLoading:    false,
  inc: () =>
    set((s) => ({ requestCount: s.requestCount + 1, isLoading: true })),
  dec: () =>
    set((s) => {
      const next = Math.max(0, s.requestCount - 1)
      return { requestCount: next, isLoading: next > 0 }
    }),
}))
