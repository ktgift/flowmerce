import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useParams } from "react-router-dom"
import { Box, Button, CircularProgress, Grid, Tooltip, Typography } from "@mui/material"
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"

import PoStatusChip from "../PoStatusChip"
import PoActionMenu from "./PoActionMenu"
import PoOverviewTab from "./PoOverviewTab"
import PoItemsTab from "./PoItemsTab"
import PoReceiptsTab from "./PoReceiptsTab"
import PoHistoryTab from "./PoHistoryTab"
import ReceiveDialogBody from "../ReceiveDialog"

import { usePo, useChangePoStatus, downloadPoPdf } from "@/lib/api/po.api"
import { ROUTES } from "@/lib/constants/routes"
import { useSetPageHeader } from "@/components/context/PageHeaderContext"
import { useModal }   from "@/lib/hook/useModal"
import { useSnackbar } from "@/lib/hook/useSnackbar"
import { getPoExportBlockers } from "@/lib/utils/po"
import { buildReceiveItems } from "@/lib/utils/poCalculations"

export default function PoDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const poId      = Number(id)
  const { error } = useSnackbar()
  const { openModal } = useModal()

  const [pdfLoading, setPdfLoading] = useState(false)
  const pdfLoadingRef              = useRef(false)

  const { data: po, isError } = usePo(poId)
  const changeStatus          = useChangePoStatus(poId)

  const receiveItems = useMemo(() => (po ? buildReceiveItems(po) : []), [po])

  const handleOpenReceive = useCallback(() => {
    if (!po || receiveItems.length === 0) return
    openModal({
      title:    "Receive Goods",
      width:    720,
      maxHeight: 85,
      body:     <ReceiveDialogBody poId={po.id} items={receiveItems} />,
    })
  }, [po, receiveItems, openModal])

  const exportBlockers = po
    ? getPoExportBlockers({ ...po, supplierLabel: po.supplierName })
    : []
  const canExport = exportBlockers.length === 0

  const handleExportPdf = useCallback(async () => {
    if (!po || pdfLoadingRef.current) return
    pdfLoadingRef.current = true
    setPdfLoading(true)
    try {
      await downloadPoPdf(po.id, po.poNumber)
      if (po.status !== "issued") {
        await changeStatus.mutateAsync({
          status: "issued",
          note:   "Auto-issued on Export PDF",
        })
      }
    } catch {
      error("Failed to export PDF.")
    } finally {
      pdfLoadingRef.current = false
      setPdfLoading(false)
    }
  }, [po, changeStatus, error])

  const exportTooltip = canExport ? "" : (
    <Box sx={{ py: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
        Cannot export yet:
      </Typography>
      {exportBlockers.map((b) => (
        <Typography key={b} variant="caption" sx={{ display: "block" }}>
          • {b}
        </Typography>
      ))}
    </Box>
  )

  useSetPageHeader(
    po
      ? {
          title:       po.poNumber,
          titleSuffix: <PoStatusChip status={po.status} />,
          subtitle: [
            po.supplierName ?? "—",
            `${po.currency} ${po.totalAmount.toLocaleString()}`,
            po.expectedDate ? `Expected ${po.expectedDate}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          breadcrumbs: [
            { label: "Purchase Orders", href: ROUTES.purchaseOrders },
            { label: po.poNumber },
          ],
          actions: (
            <>
              <Tooltip title={exportTooltip} arrow placement="bottom-end">
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      pdfLoading ? (
                        <CircularProgress size={14} />
                      ) : (
                        <PictureAsPdfOutlinedIcon />
                      )
                    }
                    disabled={!canExport || pdfLoading}
                    onClick={handleExportPdf}
                  >
                    Export PDF
                  </Button>
                </span>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<ShoppingCartIcon />}
                disabled={receiveItems.length === 0}
                onClick={handleOpenReceive}
              >
                Receive
              </Button>
              <PoActionMenu id={po.id} status={po.status} />
            </>
          ),
        }
      : null,
    [po, pdfLoading, handleExportPdf, handleOpenReceive, canExport, exportTooltip, receiveItems],
  )

  useEffect(() => {
    if (isError) error("Failed to load purchase order.")
  }, [isError])

  if (!po) return null

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <PoOverviewTab po={po} />

      <PoItemsTab po={po} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <PoReceiptsTab
            receipts={po.receipts || []}
            onReceive={handleOpenReceive}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PoHistoryTab history={po.history || []} />
        </Grid>
      </Grid>
    </Box>
  )
}
