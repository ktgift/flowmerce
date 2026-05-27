import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

import { endpoints } from "@/lib/config/endpoints"
import { api } from "@/lib/api/axios"

interface PoPdfPreviewContentProps {
  poId: number
}

export default function PoPdfPreviewContent({ poId }: PoPdfPreviewContentProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    let revoked = false
    setLoading(true)
    setError(null)

    api.get<Blob>(endpoints.purchaseOrder.pdf(poId), { responseType: "blob" })
      .then((res) => {
        if (revoked) return
        setBlobUrl(URL.createObjectURL(res.data))
      })
      .catch(() => setError("Failed to load PDF preview."))
      .finally(() => { if (!revoked) setLoading(false) })

    return () => {
      revoked = true
      setBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null })
    }
  }, [poId])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "calc(85vh - 120px)", mx: -3, my: -2 }}>
      <iframe
        src={blobUrl ?? ""}
        title="PO PDF Preview"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </Box>
  )
}
