import { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH } from "@/lib/constants/layout"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"
import PageHeader from "@/components/common/PageHeader"
import { PageHeaderProvider, usePageHeader } from "@/components/context/PageHeaderContext"

function PageHeaderSlot() {
  const { config } = usePageHeader()
  if (!config) return null
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        pt: 3,
        pb: 2,
        bgcolor: "background.default",
        flexShrink: 0,
      }}
    >
      <PageHeader {...config} mb={0} />
    </Box>
  )
}

function MainContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const drawerWidth = !isMobile && collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH

  return (
    <Box sx={{ display: "flex", height: "100%", bgcolor: "background.default" }}>
      <Sidebar
        collapsed={!isMobile && collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: collapsed
              ? theme.transitions.duration.leavingScreen
              : theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <PageHeaderSlot />
        <Box sx={{ flexGrow: 1, overflow: "auto", overscrollBehavior: "contain" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default function MainLayout() {
  return (
    <PageHeaderProvider>
      <MainContent />
    </PageHeaderProvider>
  )
}
