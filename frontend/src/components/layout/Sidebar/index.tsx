import Drawer from "@mui/material/Drawer"
import { useTheme } from "@mui/material/styles"
import SidebarContent from "./SidebarContent"
import { DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH } from "../../../lib/constants/layout"

export interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onMobileClose: () => void
  onToggleCollapse: () => void
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
  onToggleCollapse,
}: SidebarProps) {
  const theme = useTheme()
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH

  return (
    <>
      {/* Desktop: permanent collapsible drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            border: "none",
            borderRight: "1px solid",
            borderColor: "divider",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: collapsed
                ? theme.transitions.duration.leavingScreen
                : theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </Drawer>

      {/* TODO: create mobile, tablet vertical layout */}
      {/* Mobile: temporary overlay drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <SidebarContent collapsed={false} onToggleCollapse={onMobileClose} />
      </Drawer>
    </>
  )
}
