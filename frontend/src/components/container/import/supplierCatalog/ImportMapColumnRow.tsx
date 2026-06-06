import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

import AppSelect, { type AppSelectOption } from "@/components/common/AppSelect"
import { COLORS } from "@/lib/constants/colors"

interface ImportMapColumnRowProps {
  header:    string
  sample:    string
  field:     string
  options:   AppSelectOption[]
  onChange:  (field: string) => void
  isFirst?:  boolean
}

export default function ImportMapColumnRow({
  header,
  sample,
  field,
  options,
  onChange,
  isFirst,
}: ImportMapColumnRowProps) {
  return (
    <Box
      sx={{
        display:             "grid",
        gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) 24px minmax(0, 1fr)" },
        alignItems:          "center",
        columnGap:           1.5,
        rowGap:              0.75,
        py:                  1.75,
        borderTop:           isFirst ? "none" : `1px solid ${COLORS.border}`,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize:     "0.92rem",
            fontWeight:   700,
            color:        COLORS.textLabelBlack,
            fontFamily:   "ui-monospace, SFMono-Regular, monospace",
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          {header}
        </Typography>
        {sample && (
          <Typography
            sx={{
              fontSize:     "0.78rem",
              color:        COLORS.subText,
              mt:           0.25,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            e.g. "{sample}"
          </Typography>
        )}
      </Box>

      <Box sx={{ display: { xs: "none", sm: "flex" }, justifyContent: "center" }}>
        <ArrowForwardIcon sx={{ fontSize: 18, color: COLORS.neutral }} />
      </Box>

      <AppSelect
        value={field}
        onChange={onChange}
        options={options}
        sx={{ width: "100%" }}
      />
    </Box>
  )
}
