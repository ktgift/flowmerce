import AddIcon from "@mui/icons-material/Add";

import { Box, Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "@/components/common/DataTable";
import { useSetPageHeader } from "@/components/context/PageHeaderContext";
import { useDeletePo, usePoList } from "@/lib/api/po.api";
import { PO_PAGE_SIZE_OPTIONS } from "@/lib/constants/po";
import { ROUTES } from "@/lib/constants/routes";
import { useConfirmDialog } from "@/lib/hook/useConfirmDialog";
import { useModal } from "@/lib/hook/useModal";
import { usePoFilterStore } from "@/lib/store/poFilterStore";
import { columns } from "./Column";
import PoSearchSection from "./PoSearchSection";
import PoSummaryBanner from "./PoSummaryBanner";
import { COLORS } from "@/lib/constants/colors";

export default function PoListPage() {
  const navigate       = useNavigate();
  const { confirm }    = useConfirmDialog();
  const { openModal }  = useModal();

  const { status, supplierId, search } = usePoFilterStore();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(PO_PAGE_SIZE_OPTIONS[0]);

  const { mutate: deletePo } = useDeletePo();

  const handleView = (id: number) => {
    navigate(`${ROUTES.purchaseOrders}/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`${ROUTES.purchaseOrders}/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    confirm({
      title: "Delete Purchase Order",
      message: "Are you sure you want to delete this purchase order? This action cannot be undone.",
      confirmLabel: "Delete",
      confirmColor: "error",
    }).then((confirmed) => {
      if (confirmed) deletePo(id);
    });
  };

  const handleNew = () => {
    navigate(`${ROUTES.purchaseOrders}/new`)
  }

  useEffect(() => {
    setPage(0);
  }, [status, supplierId, search]);

  useSetPageHeader(
    {
      title: "Purchase Orders",
      breadcrumbs: [{ label: "Procurement" }, { label: "Purchase Orders" }],
      actions: (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleNew}
        >
          New PO
        </Button>
      ),
    },
    [navigate],
  );

  const { data: res } = usePoList({
    status: status || undefined,
    supplierId: supplierId ?? undefined,
    search: search || undefined,
  });

  const data = res ?? [];

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  

  return (
    <Box sx={{ pb: 3, pt: 0 }}>
      <PoSummaryBanner />
      <Box sx={{ px: { xs: 2, md: 3 }, mt: 3 }}>
        <DataTable
          rows={paginated}
          columns={columns({ handleView, handleEdit, handleDelete, openModal })}
          total={data.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          isBorderTop
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
          filterBar={<PoSearchSection />}
        />
      </Box>
    </Box>
  );
}
