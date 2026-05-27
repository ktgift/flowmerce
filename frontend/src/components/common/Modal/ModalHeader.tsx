import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import CloseIcon from "@mui/icons-material/Close"

interface ModalHeaderProps {
  title: string
  titleLine?: boolean
  onClose: () => void
}

export default function ModalHeader({ title, titleLine, onClose }: ModalHeaderProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {titleLine && <Divider />}
    </>
  )
}
