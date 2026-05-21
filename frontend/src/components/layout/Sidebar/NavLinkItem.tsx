import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Tooltip from "@mui/material/Tooltip"
import { useTheme } from "@mui/material/styles"
import { Link, useLocation } from "react-router-dom"
import type { NavItem } from "./navConfig"

interface Props {
  item: NavItem
  collapsed: boolean
}

export default function NavLinkItem({ item, collapsed }: Props) {
  const { pathname } = useLocation()
  const theme = useTheme()

  const isActive = item.exact
    ? pathname === item.to
    : pathname === item.to || pathname.startsWith(item.to + "/")

  return (
    <Tooltip title={collapsed ? item.label : ""} placement="right">
      <Link to={item.to} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <ListItemButton
          selected={isActive}
          sx={{
            minHeight: 40,
            borderRadius: 1.5,
            mx: 1,
            mb: 0.25,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 1.5,
            "&.Mui-selected": {
              bgcolor: `${theme.palette.primary.main}14`,
              color: "primary.main",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
            "&.Mui-selected:hover": {
              bgcolor: `${theme.palette.primary.main}22`,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 1.5,
              color: isActive ? "primary.main" : "text.secondary",
              justifyContent: "center",
            }}
          >
            <item.icon fontSize="small" />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontSize: 14, fontWeight: isActive ? 600 : 400 } } }}
            />
          )}
        </ListItemButton>
      </Link>
    </Tooltip>
  )
}
