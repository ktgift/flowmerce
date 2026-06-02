import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

import Card from "@/components/common/Card"
import StatusBadge from "@/components/common/StatusBadge"
import { COLORS } from "@/lib/constants/colors"

// TODO: replace with real history API once available — placeholder data for now
type HistoryStatus = "success" | "warning" | "failed"

interface ImportHistoryRow {
  id:        string
  date:      string
  file:      string
  template:  string | null
  created:   number
  updated:   number
  errors:    number
  status:    HistoryStatus
  by:        string
}

const PLACEHOLDER_ROWS: ImportHistoryRow[] = [
  { id: "1", date: "May 16, 16:24", file: "Kalsec_price_list_v100.xlsx", template: "Kalsec Price List",      created: 45, updated: 1575, errors: 0,  status: "success", by: "Khun Nawat"   },
  { id: "2", date: "May 14, 09:12", file: "DSM_Q2_2026.xlsx",            template: "DSM-Firmenich Quote",    created: 0,  updated: 312,  errors: 4,  status: "warning", by: "Khun Sirinya" },
  { id: "3", date: "May 10, 11:40", file: "customers_april.xlsx",        template: "Customer Master v2",     created: 28, updated: 5,    errors: 0,  status: "success", by: "Khun Naphat"  },
  { id: "4", date: "May 08, 14:08", file: "IFF_allocation.xlsx",         template: "IFF Catalog Export",     created: 12, updated: 88,   errors: 0,  status: "success", by: "Khun Nawat"   },
  { id: "5", date: "May 02, 10:15", file: "givaudan_pricelist.xlsx",     template: null,                     created: 0,  updated: 0,    errors: 12, status: "failed",  by: "Khun Nawat"   },
]

const STATUS_CONFIG: Record<HistoryStatus, { label: string; bg: string; color: string }> = {
  success: { label: "Success", bg: COLORS.greenLight,  color: COLORS.greenDark  },
  warning: { label: "Warning", bg: COLORS.orangeLight, color: COLORS.orangeDark },
  failed:  { label: "Failed",  bg: COLORS.redLighter,  color: COLORS.redDark    },
}

export default function ImportHistoryTable() {
  return (
    <Card sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px:             2.5,
          py:             2,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: COLORS.textLabelBlack }}>
          Import History
        </Typography>
        <Button
          size="small"
          endIcon={<ChevronRightIcon />}
          sx={{ color: COLORS.primary, textTransform: "none", fontWeight: 600 }}
        >
          View All
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: COLORS.backgroundDefault }}>
              <HeadCell>Date</HeadCell>
              <HeadCell>File</HeadCell>
              <HeadCell>Template</HeadCell>
              <HeadCell align="right">Created</HeadCell>
              <HeadCell align="right">Updated</HeadCell>
              <HeadCell align="right">Errors</HeadCell>
              <HeadCell>Status</HeadCell>
              <HeadCell>By</HeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PLACEHOLDER_ROWS.map((row) => (
              <HistoryRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

function HeadCell({
  children,
  align,
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <TableCell
      align={align ?? "left"}
      sx={{
        fontSize:      "0.7rem",
        fontWeight:    700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color:         COLORS.subText,
        borderBottom:  `1px solid ${COLORS.border}`,
      }}
    >
      {children}
    </TableCell>
  )
}

function HistoryRow({ row }: { row: ImportHistoryRow }) {
  const cfg = STATUS_CONFIG[row.status]

  return (
    <TableRow hover>
      <BodyCell>
        <Typography sx={{ fontSize: "0.8rem", color: COLORS.subText }}>{row.date}</Typography>
      </BodyCell>
      <BodyCell>
        <Typography sx={{ fontSize: "0.82rem", fontFamily: "monospace", color: COLORS.textLabelBlack }}>
          {row.file}
        </Typography>
      </BodyCell>
      <BodyCell>
        <Typography sx={{ fontSize: "0.82rem", color: row.template ? COLORS.text : COLORS.neutral }}>
          {row.template ?? "—"}
        </Typography>
      </BodyCell>
      <BodyCell align="right">
        <NumberText value={row.created} />
      </BodyCell>
      <BodyCell align="right">
        <NumberText value={row.updated} />
      </BodyCell>
      <BodyCell align="right">
        <Typography
          sx={{
            fontSize:   "0.82rem",
            fontWeight: row.errors > 0 ? 600 : 400,
            color:      row.errors > 0 ? COLORS.error : COLORS.subText,
          }}
        >
          {row.errors}
        </Typography>
      </BodyCell>
      <BodyCell>
        <StatusBadge
          status={cfg.label}
          backgroundColor={cfg.bg}
          color={cfg.color}
        />
      </BodyCell>
      <BodyCell>
        <Typography sx={{ fontSize: "0.82rem", color: COLORS.text }}>{row.by}</Typography>
      </BodyCell>
    </TableRow>
  )
}

function BodyCell({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <TableCell
      align={align ?? "left"}
      sx={{ borderBottom: `1px solid ${COLORS.border}`, py: 1.25 }}
    >
      {children}
    </TableCell>
  )
}

function NumberText({ value }: { value: number }) {
  return (
    <Typography sx={{ fontSize: "0.82rem", color: COLORS.text, fontVariantNumeric: "tabular-nums" }}>
      {value.toLocaleString()}
    </Typography>
  )
}
