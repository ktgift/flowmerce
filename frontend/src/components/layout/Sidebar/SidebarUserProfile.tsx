import { useLogout } from "@/lib/api/auth"
import { COLORS } from "@/lib/constants/colors"
import { useAuthStore } from "@/lib/store/authStore"
import LogoutIcon from "@mui/icons-material/Logout"
import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material"

interface Props {
  collapsed: boolean
}

export default function SidebarUserProfile({ collapsed }: Props) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  const initials =
    user?.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "N/A"

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: collapsed ? 0 : 2,
        py: 1.25,
        justifyContent: collapsed ? "center" : "flex-start",
      }}
    >
      <Tooltip title={collapsed ? (user?.name ?? "") : ""} placement="right">
        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: COLORS.primarylight, flexShrink: 0, color: COLORS.primary }}>
          {initials}
        </Avatar>
      </Tooltip>
      {!collapsed && (
        <>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>
              {user?.name ?? "Unknown User"}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ textTransform: "capitalize", display: "block", color: COLORS.subText, fontSize: 11 }}
            >
              {user?.role ?? "Unknown Role"}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton
              size="small"
              onClick={() => logout.mutate()} //TODO logout
              sx={{ color: "text.secondary" }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  )
}
