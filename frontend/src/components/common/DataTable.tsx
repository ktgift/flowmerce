import { useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef as TColumnDef,
} from "@tanstack/react-table"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"

import Card from "@/components/common/Card"
import { COLORS } from "@/lib/constants/colors"

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  width?: number | string
  align?: "left" | "center" | "right"
}

interface DataTableProps<T> {
  rows: T[]
  columns: TableColumn<T>[]
  total: number
  page: number
  pageSize: number
  headerAlign?: "left" | "center" | "right"
  cellAlign?: "left" | "center" | "right"
  headerColor?: string
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  loading?: boolean
  onRowClick?: (row: T) => void
  /** Section title rendered inside the Card with a bottom divider */
  title?: React.ReactNode
  filterBar?: React.ReactNode
  /** Replaces the generated TableBody rows with custom content */
  customBody?: React.ReactNode
  /** Hide pagination footer */
  noPagination?: boolean
  isBorderTop?: boolean
}

export default function DataTable<T extends object>({
  rows,
  columns,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  onRowClick,
  headerAlign = "center",
  cellAlign = "left",
  headerColor,
  title,
  filterBar,
  customBody,
  noPagination,
  isBorderTop = false,
}: DataTableProps<T>) {
  const tanstackColumns = useMemo<TColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        id: String(col.key),
        header: col.label,
        meta: { align: col.align },
        ...(col.render
          ? { cell: ({ row }) => col.render!(row.original) }
          : { accessorFn: (row) => (row as Record<string, unknown>)[String(col.key)] }),
        ...(col.width !== undefined ? { size: Number(col.width) } : {}),
      })),
    [columns],
  )

  const table = useReactTable({
    data: rows,
    columns: tanstackColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
  })

  return (
    <Card sx={{ overflow: "hidden" }}>
      {title && (
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          {title}
        </Box>
      )}
      {filterBar && <Box sx={{ p: 2 }}>{filterBar}</Box>}
      <TableContainer sx={{ position: "relative", minHeight: 120 }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.6)",
              zIndex: 1,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} sx={{ backgroundColor: headerColor || "grey.100", borderTop: isBorderTop ? "1px solid" : "none", borderColor: "divider" }}>
                {hg.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    align={headerAlign}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      ...(header.column.columnDef.size
                        ? { width: header.column.columnDef.size }
                        : {}),
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {customBody ?? (
              rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 6, color: "text.disabled" }}
                  >
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover={!!onRowClick}
                    onClick={() => onRowClick?.(row.original)}
                    sx={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        align={cell.column.columnDef.meta?.align ?? cellAlign}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!noPagination && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Total {total.toLocaleString()} records
          </Typography>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} of ${count}`
            }
            sx={{ border: "none" }}
          />
        </Box>
      )}
    </Card>
  )
}
