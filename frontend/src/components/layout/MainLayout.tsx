import { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH } from "@/lib/constants/layout";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); 
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerWidth =
    !isMobile && collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  //TODO create mobile, tablet vertical layout
  // if (isMobile) {
  //   return (
  //     <Box></Box>
  //   )
  // }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        bgcolor: "background.default",
      }}
    >
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
        <Box sx={{ flexGrow: 1, overflow: "auto", overscrollBehavior: "contain" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
