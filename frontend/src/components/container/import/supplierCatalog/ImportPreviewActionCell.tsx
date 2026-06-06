import Box from "@mui/material/Box"

import { COLORS } from "@/lib/constants/colors"

export type PreviewAction = "create" | "update" | "skip"

interface ImportPreviewActionCellProps {
  action: PreviewAction
}

const ACTION_STYLE: Record<PreviewAction, { color: string }> = {
  create: { color: COLORS.greenDark },
  update: { color: COLORS.primary },
  skip:   { color: COLORS.neutral },
}

export default function ImportPreviewActionCell({ action }: ImportPreviewActionCellProps) {
  return (
    <Box
      component="span"
      sx={{
        fontSize:   "0.82rem",
        fontWeight: 600,
        color:      ACTION_STYLE[action].color,
      }}
    >
      {action}
    </Box>
  )
}
