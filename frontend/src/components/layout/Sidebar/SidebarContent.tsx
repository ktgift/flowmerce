import { COLORS } from "@/lib/constants/colors"
import { ROUTES } from "@/lib/constants/routes"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { LogoBox } from "./LogoBox"
import NavLinkItem from "./NavLinkItem"
import SidebarUserProfile from "./SidebarUserProfile"
import { NAV_SECTIONS } from "./navConfig"

interface Props {
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function SidebarContent({ collapsed, onToggleCollapse }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: COLORS.backgroundPaper }}>
      {/* App logo */}
      <LogoBox collapsed={collapsed} />

      {/* Nav sections */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", pt: 0, pb: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.title}>
            {!collapsed ? (
              <Typography
                variant="caption"
                sx={{
                  px: 2.5,
                  pt: 1.5,
                  pb: 0.5,
                  display: "block",
                  color: "text.disabled",
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  fontSize: 11,
                }}
              >
                {section.title}
              </Typography>
            ) : (
              <Box sx={{ pt: 1 }} />
            )}
            <List dense disablePadding>
              {section.items.map((item) => (
                <NavLinkItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Bottom nav */}
      <List dense disablePadding sx={{ py: 0.5 }}>
        {[
          { label: "Notifications", icon: NotificationsOutlinedIcon, to: ROUTES.notification },
          { label: "Settings", icon: SettingsOutlinedIcon, to: ROUTES.setting },
        ].map(({ label, icon: Icon, to }) => (
          <Tooltip key={to} title={collapsed ? label : ""} placement="right">
            <Link to={to} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1,
                  mb: 0.25,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 1.5,
                    color: "text.secondary",
                    justifyContent: "center",
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText primary={label} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
                )}
              </ListItemButton>
            </Link>
          </Tooltip>
        ))}
      </List>

      {/* User profile */}
      <SidebarUserProfile collapsed={collapsed} />

      {/* Collapse toggle */}
      <Box
        component="button"
        onClick={onToggleCollapse}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          px: collapsed ? 0 : 2,
          py: 1,
          border: `1.5px dashed ${COLORS.graylight}`,
          borderRadius: 1,
          bgcolor: "transparent",
          cursor: "pointer",
          color: "text.secondary",
          width: "90%",
          mx: "auto",
          my: 1,
          "&:hover": { bgcolor: "action.hover" },
          transition: "background-color 0.2s",
        }}
      >
        {collapsed ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <>
            <ChevronLeftIcon fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Collapse
            </Typography>
          </>
        )}
      </Box>
    </Box>
  )
}
