import Backdrop from "@mui/material/Backdrop"
import CircularProgress from "@mui/material/CircularProgress"
import { useLoaderStore } from "@/lib/services/loaderService"

export default function GlobalLoader() {
  const isLoading = useLoaderStore((s) => s.isLoading)
  return (
    <Backdrop
      open={isLoading}
      sx={{ zIndex: 9999, backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <CircularProgress sx={{ color: "#fff" }} />
    </Backdrop>
  )
}
