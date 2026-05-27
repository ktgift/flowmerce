import type { TableColumn } from "@/components/common/DataTable";
import type { PoListItem } from "@/lib/@types/po";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { Box, IconButton } from "@mui/material";
import PoStatusChip from "../PoStatusChip";
import PoStatusModalBody from "../detail/PoStatusModalBody";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import type { ModalOptions } from "@/lib/@types/ui";
import { COLORS } from "@/lib/constants/colors";

type Props = {
  handleView: (id: number) => void;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  openModal: (options: ModalOptions) => void
}

export const columns = ({ handleView, handleEdit, handleDelete, openModal }: Props): TableColumn<PoListItem>[] => {
  return [
    {
      key: "poNumber",
      label: "PO #",
      width: 160,
      render: (row) => (
        <Box
          component="span"
          sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.85rem" }}
        >
          {row.poNumber}
        </Box>
      ),
    },
    {
      key: "supplierName",
      label: "Supplier",
      render: (row) => row.supplierName ?? "—",
    },
    {
      key: "totalAmount",
      label: "Total",
      width: 140,
      render: (row) => (
        <Box component="span" sx={{ fontWeight: 600 }}>
          {formatMoney(row.totalAmount, row.currency)}
        </Box>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (row) => (
        <PoStatusChip
          status={row.status}
          onClick={() =>
            openModal({
              title:           "Update PO Status",
              body:            <PoStatusModalBody poId={row.id} currentStatus={row.status} />,
              closeOnBackdrop: true,
              titleLine:        true,
            })
          }
        />
      ),
    },
    {
      key: "expectedDate",
      label: "Expected",
      width: 130,
      render: (row) => formatDate(row.expectedDate),
    },
    {
      key: "actions",
      label: "Action",
      width: 120,
      align: "center",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          <IconButton onClick={() => handleView(row.id)} size="small">
            <RemoveRedEyeIcon fontSize="small" sx={{ color: COLORS.primary}} />
          </IconButton>
          <IconButton onClick={() => handleEdit(row.id)} size="small">
            <CreateIcon fontSize="small" sx={{ color: COLORS.primary }} />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.id)} size="small">
            <DeleteIcon fontSize="small" sx={{ color: COLORS.redDark }} />
          </IconButton>
        </Box>
      ),
    },
];
}