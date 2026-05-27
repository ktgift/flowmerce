import Backdrop from "@mui/material/Backdrop"
import CircularProgress from "@mui/material/CircularProgress"
import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { useLoaderStore } from "@/lib/services/loaderService"

export default function GlobalLoader() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isManual   = useLoaderStore((s) => s.isLoading)
  const isLoading  = isFetching > 0 || isMutating > 0 || isManual

  return (
    <Backdrop
      open={isLoading}
      sx={{
        zIndex:          9999,
        backdropFilter:  "blur(4px)",
        backgroundColor: "rgba(0,0,0,0.4)",
        pointerEvents:   isLoading ? "auto" : "none",
      }}
    >
      <CircularProgress sx={{ color: "#fff" }} />
    </Backdrop>
  )
}
