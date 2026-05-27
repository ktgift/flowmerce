import {
  createContext, useContext, useState, useMemo,
  useEffect,
  type ReactNode, type DependencyList,
} from "react"
import type { PageHeaderConfig } from "@/lib/@types/ui"

// ─── Contexts ────────────────────────────────────────────────────────────────

interface PageHeaderState {
  config: PageHeaderConfig | null
}

interface PageHeaderDispatch {
  setConfig: (config: PageHeaderConfig | null) => void
}

const PageHeaderStateCtx    = createContext<PageHeaderState | null>(null)
const PageHeaderDispatchCtx = createContext<PageHeaderDispatch | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PageHeaderConfig | null>(null)

  const dispatch = useMemo<PageHeaderDispatch>(() => ({ setConfig }), [])

  return (
    <PageHeaderDispatchCtx.Provider value={dispatch}>
      <PageHeaderStateCtx.Provider value={{ config }}>
        {children}
      </PageHeaderStateCtx.Provider>
    </PageHeaderDispatchCtx.Provider>
  )
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function usePageHeader(): PageHeaderState {
  const ctx = useContext(PageHeaderStateCtx)
  if (!ctx) throw new Error("usePageHeader must be used inside PageHeaderProvider")
  return ctx
}

function usePageHeaderDispatch(): PageHeaderDispatch {
  const ctx = useContext(PageHeaderDispatchCtx)
  if (!ctx) throw new Error("usePageHeader must be used inside PageHeaderProvider")
  return ctx
}

// Pass actions inside config.actions — memoize the actions with useMemo to avoid
// unnecessary re-renders when other unrelated state in the page component changes.
export function useSetPageHeader(config: PageHeaderConfig | null, deps: DependencyList = []) {
  const { setConfig } = usePageHeaderDispatch()
  useEffect(() => {
    setConfig(config)
    return () => setConfig(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
