import Box from "@mui/material/Box"
import Radio from "@mui/material/Radio"
import Typography from "@mui/material/Typography"
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined"
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined"

import StatusBadge from "@/components/common/StatusBadge"
import { COLORS } from "@/lib/constants/colors"
import type { ImportSheetRow } from "@/lib/@types/import"

interface ImportSheetRowItemProps {
  row:      ImportSheetRow
  active:   boolean
  isBest?:  boolean
  rowCount?: number
  colCount?: number
  onClick:  () => void
}

export default function ImportSheetRowItem({
  row,
  active,
  isBest,
  rowCount,
  colCount,
  onClick,
}: ImportSheetRowItemProps) {
  const isData = row.kind === "data"

  return (
    <Box
      onClick={onClick}
      sx={{
        display:      "flex",
        alignItems:   "center",
        gap:          1.25,
        p:            1.5,
        border:       "1.5px solid",
        borderColor:  active ? COLORS.primary : COLORS.border,
        borderRadius: 2,
        bgcolor:      active ? COLORS.primarylight : COLORS.white,
        cursor:       "pointer",
        transition:   "all 0.15s",
        "&:hover":    { borderColor: COLORS.primary },
      }}
    >
      <Radio
        checked={active}
        size="small"
        sx={{ p: 0.5, color: COLORS.neutral, "&.Mui-checked": { color: COLORS.primary } }}
      />

      <Box
        sx={{
          width:          36,
          height:         36,
          flexShrink:     0,
          borderRadius:   1.5,
          bgcolor:        COLORS.purpleLight,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <GridOnOutlinedIcon sx={{ fontSize: 18, color: COLORS.purpleDark }} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography
            sx={{
              fontSize:     "0.9rem",
              fontWeight:   700,
              color:        COLORS.textLabelBlack,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {row.name}
          </Typography>
          {isBest && (
            <Box
              sx={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          0.35,
                px:           0.75,
                py:           0.25,
                bgcolor:      COLORS.purpleLighter,
                color:        COLORS.purpleDark,
                borderRadius: "999px",
                fontSize:     "0.68rem",
                fontWeight:   700,
              }}
            >
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 11 }} />
              Best match
            </Box>
          )}
        </Box>
        {(rowCount !== undefined || colCount !== undefined) && (
          <Typography sx={{ fontSize: "0.75rem", color: COLORS.subText, mt: 0.25 }}>
            {rowCount !== undefined && `${rowCount.toLocaleString()} rows`}
            {rowCount !== undefined && colCount !== undefined && " · "}
            {colCount !== undefined && `${colCount} columns`}
          </Typography>
        )}
      </Box>

      <StatusBadge
        status={isData ? "data" : "non-data"}
        backgroundColor={isData ? COLORS.greenLight : COLORS.orangeLight}
        color={isData ? COLORS.greenDark : COLORS.orangeDark}
      />
    </Box>
  )
}
