import { COLORS } from "@/lib/constants/colors";
import type { SxProps, Theme } from "@mui/material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  message?: string;
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

export default function EmptyState({
  icon,
  message = "No data",
  action,
  sx,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 1.5,
        bgcolor: COLORS.backgroundDefault,
        borderRadius: 2,
        border: "1.5px dashed",
        borderColor: COLORS.border,
        ...sx,
      }}
    >
      {icon}
      <Typography sx={{ color: COLORS.neutral, fontSize: "0.9rem" }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
}
