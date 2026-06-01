import { useMemo } from "react"
import Typography from "@mui/material/Typography"

import DataTable, { type TableColumn } from "@/components/common/DataTable"
import type { PoDetail, PoItem } from "@/lib/@types/po"
import { formatMoney, formatNumber } from "@/lib/utils/format"
import { COLORS } from "@/lib/constants/colors"
import { calcItemCost, buildReceivedMap } from "@/lib/utils/poCalculations"

interface PoItemsTabProps {
  po: PoDetail
}

interface EnrichedPoItem extends PoItem {
  cifThb:        number
  landedPerUnit: number
  lineTotal:     number
  remainingQty:  number
}

function enrichItem(
  item:         PoItem,
  exchangeRate: number,
  receivedMap:  Record<number, number>,
): EnrichedPoItem {
  const { cifThb, landed: landedPerUnit } = calcItemCost({
    cifUsdPerUnit:        item.cifPrice ?? 0,
    taxRate:              item.taxRate ?? 0,
    clearingCost:         item.clearingCost ?? 0,
    warehouseCostPercent: item.warehouseCostPercent ?? 0,
    exchangeRate,
  })
  const remainingQty = item.quantity - (receivedMap[item.id] ?? 0)
  return { ...item, cifThb, landedPerUnit, lineTotal: landedPerUnit * item.quantity, remainingQty }
}

function buildColumns(currency: string): TableColumn<EnrichedPoItem>[] {
  return [
    {
      key: "name",
      label: "Product",
      align: "left",
      render: (row) => (
        <>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.name}</Typography>
          {row.sku && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {row.sku}
            </Typography>
          )}
        </>
      ),
    },
    { key: "quantity",            label: "Qty",       align: "right", render: (row) => formatNumber(row.quantity, 0) },
    { key: "exWorkPrice",         label: "Ex-Work",   align: "right", render: (row) => formatMoney(row.exWorkPrice, currency) },
    { key: "freightCost",         label: "Freight",   align: "right", render: (row) => formatMoney(row.freightCost, currency) },
    { key: "cifPrice",            label: "CIF (USD)", align: "right", render: (row) => formatMoney(row.cifPrice, currency) },
    { key: "cifThb",              label: "CIF (THB)", align: "right", render: (row) => formatNumber(row.cifThb, 0) },
    { key: "taxRate",             label: "Tax",       align: "right", render: (row) => formatNumber(row.taxRate, 0) },
    { key: "clearingCost",        label: "Clearing",  align: "right", render: (row) => formatNumber(row.clearingCost, 0) },
    {
      key: "warehouseCostPercent",
      label: "WH %",
      align: "right",
      render: (row) => row.warehouseCostPercent != null ? `${row.warehouseCostPercent}%` : "—",
    },
    { key: "landedPerUnit", label: "Landed / U", align: "right", render: (row) => formatMoney(row.landedPerUnit, "THB") },
    { key: "lineTotal",     label: "Line Total", align: "right", render: (row) => formatMoney(row.lineTotal, "THB") },
    {
      key: "remainingQty",
      label: "Remaining",
      align: "right",
      render: (row) => (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: row.remainingQty > 0 ? COLORS.warning : COLORS.success,
          }}
        >
          {formatNumber(row.remainingQty, 0)}
        </Typography>
      ),
    },
  ]
}

export default function PoItemsTab({ po }: PoItemsTabProps) {
  const { items, exchangeRate, currency, receipts } = po

  const receivedMap = useMemo(() => buildReceivedMap(receipts), [receipts])

  const enrichedItems = items.map((item) => enrichItem(item, exchangeRate, receivedMap))
  const columns       = buildColumns(currency)

  return (
    <DataTable
      rows={enrichedItems}
      columns={columns}
      total={items.length}
      page={0}
      pageSize={items.length || 10}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      noPagination
      headerAlign="left"
      title={
        <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1rem", mb: 1, mt: 1, color: COLORS.textLabelBlack }}>
          Items · Cost Breakdown
        </Typography>
      }
    />
  )
}
