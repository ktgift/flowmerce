import { COLORS } from "@/lib/constants/colors";
import { HEADER_HEIGHT } from "@/lib/constants/layout";
import { Box, Typography } from "@mui/material";
import logo from "@/assets/image/logo-flowmerce.png";

export const LogoBox = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: collapsed ? 0 : 2,
        py: 2,
        minHeight: HEADER_HEIGHT,
        maxHeight: HEADER_HEIGHT,
        justifyContent: collapsed ? "center" : "flex-start",
        overflow: "hidden",
      }}
    >
      <img src={logo} alt="Flowmerce Logo" style={{ width: 32, height: 32 }} />
      {/* <Box
        sx={{
          width: 32,
          height: 32,
          bgcolor: "primary.main",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        
        <Typography
          sx={{ color: "white", fontWeight: 700, fontSize: 16, lineHeight: 1 }}
        >
          F
        </Typography>
      </Box> */}
      {!collapsed && (
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Flowmerce
          </Typography>
          <Typography
            variant="caption"
            sx={{ lineHeight: 1.2, display: "block", color: COLORS.subText }}
          >
            Sales · Procurement
          </Typography>
        </Box>
      )}
    </Box>
  );
};
