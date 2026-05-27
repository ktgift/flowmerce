import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import ListItemText from "@mui/material/ListItemText"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

import type { PoStatus } from "@/lib/@types/po"
import { useDeletePo } from "@/lib/api/po.api"
import { useConfirmDialog } from "@/lib/hook/useConfirmDialog"
import { ROUTES } from "@/lib/constants/routes"

interface PoActionMenuProps {
  id:     number
  status: PoStatus
}

export default function PoActionMenu({ id, status }: PoActionMenuProps) {
  const navigate      = useNavigate()
  const { confirm }   = useConfirmDialog()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const deletePo      = useDeletePo()

  const handleOpen  = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  async function handleDelete() {
    handleClose()
    const ok = await confirm({
      title:        "Delete Purchase Order",
      message:      "This action cannot be undone. Are you sure you want to delete this PO?",
      confirmLabel: "Delete",
      confirmColor: "error",
    })
    if (!ok) return
    await deletePo.mutateAsync(id)
    navigate(ROUTES.purchaseOrders)
  }

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {status === "draft" && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={() => navigate(`${ROUTES.purchaseOrders}/${id}/edit`)}
        >
          Edit
        </Button>
      )}

      <IconButton
        size="small"
        onClick={handleOpen}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          <ListItemText primary="Delete PO" />
        </MenuItem>
      </Menu>
    </Box>
  )
}
