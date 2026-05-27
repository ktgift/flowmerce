import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import AppAutocomplete from "@/components/common/AppAutocomplete";
import AppSelect from "@/components/common/AppSelect";
import AppTextField from "@/components/common/AppTextField";
import type { SupplierOption } from "@/lib/@types/supplier";
import { useSupplierOptions } from "@/lib/api/supplier.api";
import { PO_STATUS_LABEL, PO_STATUS_LIST } from "@/lib/constants/po";
import { usePoFilterStore } from "@/lib/store/poFilterStore";

export default function PoSearchSection() {
  const {
    pendingSearch,
    pendingSupplierId,
    pendingStatus,
    setPendingSearch,
    setPendingSupplierId,
    setPendingStatus,
    applySearch,
    clearSearch,
  } = usePoFilterStore();

  const { data: supplierOptions = [] } = useSupplierOptions();

  const selectedSupplier =
    supplierOptions.find((o) => o.id === pendingSupplierId) ?? null;

  const statusOptions = PO_STATUS_LIST.map((s) => ({
    value: s,
    label: PO_STATUS_LABEL[s],
  }));

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") applySearch();
  }

  return (
    <Grid container spacing={1.5} sx={{ pt: 1, alignItems: "flex-end", mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AppAutocomplete<SupplierOption>
          fieldLabel="Supplier"
          options={supplierOptions}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          value={selectedSupplier}
          onChange={(val) => setPendingSupplierId(val ? val.id : null)}
          placeholder="Type supplier name..."
          noOptionsText="No suppliers"
          sx={{ width: "100%" }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AppTextField
          fieldLabel="PO Number"
          value={pendingSearch}
          onChange={(e) => setPendingSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="PO-2025-..."
          fullWidth
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AppSelect
          fieldLabel="Status"
          value={pendingStatus}
          onChange={(v) => setPendingStatus(v as typeof pendingStatus)}
          options={statusOptions}
          placeholder="All statuses"
          width="100%"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", alignItems: "flex-end" }}>
        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={clearSearch}
            fullWidth
            startIcon={<ClearIcon sx={{ fontSize: "16px !important" }} />}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={applySearch}
            fullWidth
            startIcon={<SearchIcon sx={{ fontSize: "16px !important" }} />}
          >
            Search
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
