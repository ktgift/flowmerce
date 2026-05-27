import { useState, useMemo } from "react"
import Box from "@mui/material/Box"
import InputAdornment from "@mui/material/InputAdornment"
import Typography from "@mui/material/Typography"
import SearchIcon from "@mui/icons-material/Search"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"

import AppTextField  from "@/components/common/AppTextField"
import MarginBadge   from "@/components/common/MarginBadge"
import EmptyState    from "@/components/common/EmptyState"
import { useProductList } from "@/lib/api/product.api"
import type { SelectedProduct } from "@/lib/@types/product"
import { COLORS } from "@/lib/constants/colors"
import { formatMoney } from "@/lib/utils/format"

interface PoProductSearchContentProps {
  onSelect: (product: SelectedProduct) => void
}

export default function PoProductSearchContent({ onSelect }: PoProductSearchContentProps) {
  const [search, setSearch] = useState("")

  const { data: products = [] } = useProductList()

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false) ||
        (p.category?.toLowerCase().includes(q) ?? false),
    )
  }, [products, search])

  return (
    <Box>
      <AppTextField
        fullWidth
        autoFocus
        placeholder="Search by name, code, or description"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: COLORS.neutral }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1.5 }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />}
          message="No products found"
          sx={{ border: "none", py: 4 }}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", maxHeight: 420, overflowY: "auto" }}>
          {filtered.map((product, idx) => (
            <Box
              key={product.id}
              onClick={() => onSelect(product)}
              sx={{
                display:     "flex",
                alignItems:  "center",
                gap:         1.5,
                px:          1.5,
                py:          1.25,
                cursor:      "pointer",
                borderTop:   idx === 0 ? "none" : "1px solid",
                borderColor: COLORS.border,
                "&:hover":   { bgcolor: COLORS.backgroundDefault },
              }}
            >
              <Box
                sx={{
                  width:          36,
                  height:         36,
                  borderRadius:   1.5,
                  bgcolor:        COLORS.graylight,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                }}
              >
                <Inventory2OutlinedIcon sx={{ fontSize: 18, color: COLORS.neutral }} />
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.3 }}>
                  {product.name}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: COLORS.subText }}>
                  {[
                    product.sku,
                    product.category,
                    product.stockQty != null
                      ? `stock ${product.stockQty} ${product.unit ?? ""}`.trim()
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Typography>
              </Box>

              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                {product.lastCostPrice != null && (
                  <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                    {formatMoney(product.lastCostPrice)}
                  </Typography>
                )}
                <MarginBadge value={product.margin} />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
