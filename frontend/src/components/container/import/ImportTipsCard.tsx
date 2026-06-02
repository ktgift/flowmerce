import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import { IMPORT_TIPS } from "@/lib/constants/import"

export default function ImportTipsCard() {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography
        sx={{
          fontSize:      "0.75rem",
          fontWeight:    700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color:         COLORS.subText,
          mb:            1.5,
        }}
      >
        Tips
      </Typography>

      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {IMPORT_TIPS.map((tip, idx) => (
          <Box
            key={idx}
            component="li"
            sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}
          >
            <Box
              sx={{
                flexShrink:     0,
                width:          22,
                height:         22,
                borderRadius:   "50%",
                bgcolor:        COLORS.pillBg,
                color:          COLORS.textLabelBlack,
                fontSize:       "0.75rem",
                fontWeight:     700,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                mt:             0.25,
              }}
            >
              {idx + 1}
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: COLORS.text, lineHeight: 1.5 }}>
              {tip}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}
