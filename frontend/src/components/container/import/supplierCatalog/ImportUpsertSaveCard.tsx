import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import Typography from "@mui/material/Typography"
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined"
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined"

import AppSelect, { type AppSelectOption } from "@/components/common/AppSelect"
import AppTextField from "@/components/common/AppTextField"
import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

interface ImportUpsertSaveCardProps {
  upsertKey:       string
  upsertOptions:   AppSelectOption[]
  onUpsertChange:  (key: string) => void
  saveTemplate:    boolean
  templateName:    string
  onToggleSave:    (next: boolean) => void
  onTemplateName:  (next: string) => void
}

export default function ImportUpsertSaveCard({
  upsertKey,
  upsertOptions,
  onUpsertChange,
  saveTemplate,
  templateName,
  onToggleSave,
  onTemplateName,
}: ImportUpsertSaveCardProps) {
  return (
    <Card
      sx={{
        display:        "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        columnGap:      2,
        rowGap:         1.5,
        p:              { xs: 1.5, md: 2 },
      }}
    >
      <Box
        sx={{
          display:        "flex",
          flexDirection:  "column",
          gap:            0.75,
          pr:             { sm: 2 },
          borderRight:    { xs: "none", sm: `1px solid ${COLORS.border}` },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <KeyOutlinedIcon sx={{ fontSize: 16, color: COLORS.subText }} />
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
            Upsert key
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: COLORS.subText }}>
            updates existing rows when matched
          </Typography>
        </Box>
        <AppSelect
          value={upsertKey}
          onChange={onUpsertChange}
          options={upsertOptions}
          sx={{ width: "100%", bgcolor: COLORS.white }}
        />
      </Box>

      <Box
        sx={{
          display:        "flex",
          flexDirection:  "column",
          gap:            0.75,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <LayersOutlinedIcon sx={{ fontSize: 16, color: COLORS.subText }} />
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
            Save as template
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: COLORS.subText }}>
            reuse this mapping next time
          </Typography>
        </Box>
        <Box
          sx={{
            display:      "flex",
            alignItems:   "center",
            gap:          1,
            p:            0.5,
            border:       "1.5px solid",
            borderColor:  saveTemplate ? COLORS.primary : COLORS.border,
            borderRadius: 2,
            bgcolor:      saveTemplate ? COLORS.primarylight : COLORS.white,
            transition:   "all 0.15s",
          }}
        >
          <Checkbox
            checked={saveTemplate}
            onChange={(e) => onToggleSave(e.target.checked)}
            size="small"
            sx={{ p: 0.5, color: COLORS.neutral, "&.Mui-checked": { color: COLORS.primary } }}
          />
          <AppTextField
            value={templateName}
            onChange={(e) => onTemplateName(e.target.value)}
            placeholder="Template name"
            disabled={!saveTemplate}
            fullWidth
            sx={{ bgcolor: COLORS.white }}
          />
        </Box>
      </Box>
    </Card>
  )
}
