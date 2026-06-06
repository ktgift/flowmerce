import Box from "@mui/material/Box"
import ButtonBase from "@mui/material/ButtonBase"
import Typography from "@mui/material/Typography"

import { COLORS } from "@/lib/constants/colors"

interface ImportStatTileProps {
  value:    number
  label:    string
  color:    string
  bgColor?: string
  onClick?: () => void
}

export default function ImportStatTile({
  value,
  label,
  color,
  bgColor,
  onClick,
}: ImportStatTileProps) {
  const content = (
    <>
      <Typography
        sx={{
          fontSize:   "2.25rem",
          fontWeight: 800,
          color,
          lineHeight: 1,
        }}
      >
        {value.toLocaleString()}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.82rem",
          color:    COLORS.subText,
          mt:       0.75,
        }}
      >
        {label}
        {onClick && (
          <Box
            component="span"
            sx={{ ml: 0.5, color: COLORS.primary, fontWeight: 700 }}
          >
            ›
          </Box>
        )}
      </Typography>
    </>
  )

  if (onClick) {
    return (
      <ButtonBase
        onClick={onClick}
        sx={{
          flex:         "1 1 0",
          minWidth:     0,
          flexDirection: "column",
          textAlign:    "center",
          px:           2,
          py:           2.5,
          borderRadius: 2,
          bgcolor:      bgColor ?? "transparent",
          transition:   "background-color 0.15s, transform 0.15s",
          "&:hover":    { bgcolor: bgColor ?? COLORS.pillBg },
          "&:active":   { transform: "scale(0.98)" },
        }}
      >
        {content}
      </ButtonBase>
    )
  }

  return (
    <Box
      sx={{
        flex:         "1 1 0",
        minWidth:     0,
        textAlign:    "center",
        px:           2,
        py:           2.5,
        borderRadius: 2,
        bgcolor:      bgColor ?? "transparent",
      }}
    >
      {content}
    </Box>
  )
}
