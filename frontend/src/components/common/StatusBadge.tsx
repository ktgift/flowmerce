import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Box, Chip, Tooltip } from "@mui/material";

interface StatusBadgeProps {
  status: string;
  backgroundColor?: string;
  color?: string;
  labelMap?: Record<string, string>;
  onClick?: () => void;
}

export default function StatusBadge({
  status,
  backgroundColor,
  color,
  labelMap,
  onClick,
}: StatusBadgeProps) {
  const labelText = labelMap?.[status] ?? status;

  const chipLabel = onClick ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
      {labelText}
      <ArrowDropDownIcon sx={{ fontSize: "0.95rem", opacity: 0.75, ml: "-2px" }} />
    </Box>
  ) : labelText;

  const chip = (
    <Chip
      label={chipLabel}
      size="small"
      variant="filled"
      onClick={onClick}
      sx={{
        fontWeight: 500,
        fontSize: "0.72rem",
        letterSpacing: "0.02em",
        backgroundColor,
        color,
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.15s, opacity 0.15s",
        ...(onClick && {
          "&:hover": {
            opacity: 0.88,
            backgroundColor,
            boxShadow: `0 0 0 2px ${backgroundColor}66`,
          },
          "&:active": { opacity: 0.7 },
        }),
      }}
    />
  );

  if (!onClick) return chip;

  return (
    <Tooltip title="Click to update status" placement="top" arrow enterDelay={400}>
      {chip}
    </Tooltip>
  );
}
