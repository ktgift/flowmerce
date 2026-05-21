import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import InputBase from "@mui/material/InputBase"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import MenuIcon from "@mui/icons-material/Menu"
import SearchIcon from "@mui/icons-material/Search"
import { useLocation } from "react-router-dom"
import { getPageTitle } from "@/lib/constants/pageTitles"
import { HEADER_HEIGHT } from "@/lib/constants/layout"
import { COLORS } from "@/lib/constants/colors"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <AppBar
      position="relative"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: COLORS.backgroundPaper, height: HEADER_HEIGHT }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          size="small"
          sx={{ display: { md: "none" }, mr: 0.5 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "grey.100",
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            width: { xs: 160, sm: 280 },
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: "text.disabled", flexShrink: 0 }} />
          <InputBase
            placeholder="ค้นหา ใบเสนอ, ลูกค้า, สินค้า..."
            sx={{ flex: 1, fontSize: 13, "& input": { p: 0 } }}
          />
          <Typography
            variant="caption"
            sx={{
              bgcolor: "white",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0.5,
              px: 0.5,
              lineHeight: 1.6,
              color: "text.disabled",
              flexShrink: 0,
              display: { xs: "none", sm: "block" },
            }}
          >
            ⌘K
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
