import Box from "@mui/material/Box"

export interface TimelineItem {
  id: string | number
  dotColor: string
  label: React.ReactNode
  subLabel?: React.ReactNode
}

interface AppTimelineProps {
  items: TimelineItem[]
}

export default function AppTimeline({ items }: AppTimelineProps) {
  return (
    <Box>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Box key={item.id} sx={{ display: "flex" }}>
            {/* Left column: dot + connector line */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mr: 1.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: item.dotColor,
                  flexShrink: 0,
                  mt: 0.35,
                }}
              />
              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 12,
                    bgcolor: "grey.200",
                    my: 0.5,
                  }}
                />
              )}
            </Box>

            {/* Right column: content */}
            <Box sx={{ pb: isLast ? 0 : 2 }}>
              {item.label}
              {item.subLabel}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
