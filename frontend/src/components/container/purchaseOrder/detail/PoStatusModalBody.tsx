import { useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

import type { PoStatus } from "@/lib/@types/po"
import { COLORS } from "@/lib/constants/colors"
import { PO_VALID_MANUAL_TRANSITIONS } from "@/lib/constants/po"
import { useChangePoStatus } from "@/lib/api/po.api"
import { useModal } from "@/lib/hook/useModal"
import { useSnackbar } from "@/lib/hook/useSnackbar"

import PoStatusAutoSection from "./PoStatusAutoSection"
import PoStatusManualSection from "./PoStatusManualSection"

interface PoStatusModalBodyProps {
  poId:          number
  currentStatus: PoStatus
}

export default function PoStatusModalBody({ poId, currentStatus }: PoStatusModalBodyProps) {
  const { closeModal }           = useModal()
  const { success, error }       = useSnackbar()
  const changeStatus             = useChangePoStatus(poId)
  const [selected, setSelected]  = useState<PoStatus | null>(null)

  const validNext = PO_VALID_MANUAL_TRANSITIONS[currentStatus] ?? []

  const handleUpdate = async () => {
    if (!selected) return
    try {
      await changeStatus.mutateAsync({ status: selected })
      success("Status updated successfully.")
      closeModal()
    } catch {
      error("Failed to update status. Please try again.")
    }
  }

  return (
    // flex: 1 lets this Box fill the Paper (which is a flex column)
    // minHeight: 0 lets flex children shrink below their content size
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

      {/* Header */}
      <Box sx={{ px: 3, pt: 1, pb: 1.5, flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
          Select the status that reflects current reality.
          Draft and Issued are set automatically by the system.
        </Typography>
      </Box>

      {/* Scrollable content — flex: 1 + minHeight: 0 make this grow & scroll */}
      <Box
        sx={{
          flex:      1,
          minHeight: 0,
          overflowY: "auto",
          px:        2.5,
          py:        1,
          "&::-webkit-scrollbar":       { width: 5 },
          "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "grey.300" },
        }}
      >
        <PoStatusAutoSection currentStatus={currentStatus} />
        <Box sx={{ mt: 2 }}>
          <PoStatusManualSection
            currentStatus={currentStatus}
            validNext={validNext}
            selected={selected}
            onSelect={setSelected}
          />
        </Box>
      </Box>

      {/* Sticky footer */}
      <Box
        sx={{
          px:          3,
          pt:          2,
          pb:          3,
          flexShrink:  0,
          borderTop:   "1px solid",
          borderColor: "divider",
          bgcolor:     "background.paper",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!selected || changeStatus.isPending}
          onClick={handleUpdate}
          sx={{
            borderRadius:  3,
            py:            1.4,
            fontWeight:    700,
            fontSize:      "1rem",
            textTransform: "none",
            boxShadow:     "none",
            "&:hover":     { boxShadow: "none" },
          }}
        >
          {changeStatus.isPending ? (
            <CircularProgress size={22} sx={{ color: "white" }} />
          ) : (
            "Update"
          )}
        </Button>
      </Box>
    </Box>
  )
}
