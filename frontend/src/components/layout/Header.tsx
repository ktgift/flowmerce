import { usePageHeader } from "@/components/context/PageHeaderContext"
import { COLORS } from "@/lib/constants/colors"
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined"
import SearchIcon from "@mui/icons-material/Search"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import IconButton from "@mui/material/IconButton"
import InputBase from "@mui/material/InputBase"
import Link from "@mui/material/Link"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { Link as RouterLink } from "react-router-dom"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { config } = usePageHeader()

  return (
    <AppBar
      position="relative"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: COLORS.backgroundPaper }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
        {config?.breadcrumbs && config.breadcrumbs.length > 0 ? (
          <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
            {config.breadcrumbs.map((crumb, i) => {
              const isLast = i === config.breadcrumbs!.length - 1
              return isLast || !crumb.href ? (
                <Typography key={i} variant="body2" sx={{ fontWeight: 600, color: !isLast ? COLORS.subText : COLORS.text }}>
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={i}
                  component={RouterLink}
                  to={crumb.href}
                  variant="body2"
                  underline="hover"
                  sx={{ color: COLORS.subText, "&:hover": { color: COLORS.black } }}
                >
                  {crumb.label}
                </Link>
              )
            })}
          </Breadcrumbs>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

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

        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <NotificationsOutlinedIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
