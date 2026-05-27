import type { ReactNode } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import type { PageHeaderConfig } from "@/lib/@types/ui"

interface PageHeaderProps extends PageHeaderConfig {
  mb?: number | string
}

export default function PageHeader({ title, titleSuffix, subtitle, breadcrumbs, actions, mb = 3 }: PageHeaderProps) {
  const section = breadcrumbs?.[0]?.label

  return (
    <Box sx={{ mb }}>
      {section && (
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", letterSpacing: 1.2, display: "block", mb: 0.5, fontSize: "0.7rem" }}
        >
          {section}
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            {titleSuffix}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle as ReactNode}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  )
}
