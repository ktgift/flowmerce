import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Box, IconButton, Typography } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"

import type { PoStatusSummaryItem } from "@/lib/@types/po"
import { COLORS, PO_STATUS_BAR_COLORS } from "@/lib/constants/colors"
import { PO_STATUS_LABEL } from "@/lib/constants/po"
import { formatMoneyCompact } from "@/lib/utils/format"

interface Props {
  items: PoStatusSummaryItem[]
  total: number
}

export default function PoStatusCards({ items, total }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft]   = useState(false)
  const [canRight, setCanRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      ro.disconnect()
    }
  }, [items, checkScroll])

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" })

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((item, idx) => {
          const pct      = total > 0 ? Math.round((item.count / total) * 100) : 0
          const barColor = PO_STATUS_BAR_COLORS[item.status] ?? COLORS.grayMedium
          const label    = PO_STATUS_LABEL[item.status as keyof typeof PO_STATUS_LABEL] ?? item.status

          return (
            <Box
              key={item.status}
              sx={{
                flexShrink: 0,
                minWidth: 110,
                pl: idx === 0 ? 0 : 2,
                pr: 2,
                borderLeft: idx === 0 ? "none" : `1px solid ${COLORS.border}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: "text.secondary",
                  mb: 0.25,
                }}
              >
                {label}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: COLORS.text }}>
                  {item.count}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                  · {pct}%
                </Typography>
              </Box>

              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: barColor, mt: 0.25 }}>
                {formatMoneyCompact(item.totalThb)}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {canLeft  && <ScrollArrow dir="left"  onClick={() => scroll("left")} />}
      {canRight && <ScrollArrow dir="right" onClick={() => scroll("right")} />}
    </Box>
  )
}

function ScrollArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <IconButton
      onClick={onClick}
      size="small"
      sx={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [dir]: -8,
        zIndex: 2,
        width: 28,
        height: 28,
        bgcolor: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.07)",
        border: "none",
        "&:hover": { bgcolor: "rgba(255,255,255,0.98)" },
      }}
    >
      {dir === "left"
        ? <ChevronLeftIcon  sx={{ fontSize: 18 }} />
        : <ChevronRightIcon sx={{ fontSize: 18 }} />}
    </IconButton>
  )
}
