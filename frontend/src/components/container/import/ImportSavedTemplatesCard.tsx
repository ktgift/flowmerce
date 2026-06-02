import Box from "@mui/material/Box"
import ButtonBase from "@mui/material/ButtonBase"
import Skeleton from "@mui/material/Skeleton"
import Typography from "@mui/material/Typography"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"
import { useImportTemplates } from "@/lib/api/import.api"
import type { ImportTemplate } from "@/lib/@types/import"

interface ImportSavedTemplatesCardProps {
  onSelect?: (template: ImportTemplate) => void
}

export default function ImportSavedTemplatesCard({ onSelect }: ImportSavedTemplatesCardProps) {
  const { data: templates, isLoading } = useImportTemplates()

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
        Saved Templates
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {isLoading && (
          <>
            <Skeleton variant="rounded" height={48} />
            <Skeleton variant="rounded" height={48} />
            <Skeleton variant="rounded" height={48} />
          </>
        )}

        {!isLoading && (templates?.length ?? 0) === 0 && (
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.subText, py: 1 }}>
            No saved templates yet.
          </Typography>
        )}

        {!isLoading && templates?.map((tpl) => (
          <TemplateRow key={tpl.id} template={tpl} onSelect={onSelect} />
        ))}
      </Box>
    </Card>
  )
}

function TemplateRow({
  template,
  onSelect,
}: {
  template: ImportTemplate
  onSelect?: (template: ImportTemplate) => void
}) {
  const columnCount = Object.keys(template.columnMapping ?? {}).length

  return (
    <ButtonBase
      onClick={() => onSelect?.(template)}
      sx={{
        width:        "100%",
        textAlign:    "left",
        borderRadius: 1.5,
        px:           1.25,
        py:           1,
        display:      "flex",
        alignItems:   "center",
        gap:          1.25,
        "&:hover":    { bgcolor: COLORS.pillBg },
      }}
    >
      <Box
        sx={{
          flexShrink:     0,
          width:          32,
          height:         32,
          borderRadius:   1.25,
          bgcolor:        COLORS.pillBg,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <LayersOutlinedIcon sx={{ fontSize: 18, color: COLORS.textLabelBlack }} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize:     "0.875rem",
            fontWeight:   600,
            color:        COLORS.textLabelBlack,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          {template.name}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: COLORS.subText }}>
          {columnCount} columns
        </Typography>
      </Box>

      <ChevronRightIcon sx={{ color: COLORS.neutral, fontSize: 18 }} />
    </ButtonBase>
  )
}
