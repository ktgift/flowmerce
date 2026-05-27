import type { Control, UseFormSetValue, UseFieldArrayReturn } from "react-hook-form"
import { useWatch } from "react-hook-form"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import AddIcon from "@mui/icons-material/Add"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"

import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import type { TableColumn } from "@/components/common/DataTable"
import type { PoCreateFormValues } from "@/lib/schema/po.schema"
import { SectionCard, SectionTitle } from "./PoInfoSection"
import PoItemRow from "./PoItemRow"
import PoTotalsSummary from "./PoTotalsSummary"

const COLUMNS: TableColumn<object>[] = [
  { key: "name",      label: "Product",  width: 160 },
  { key: "quantity",  label: "QTY",      width: 80  },
  { key: "unit",      label: "Unit",     width: 70  },
  { key: "exw",       label: "EXW $",    width: 90  },
  { key: "freight",   label: "Freight",  width: 80  },
  { key: "cifUsd",    label: "CIF $",    width: 80  },
  { key: "cifThb",    label: "CIF ฿",    width: 90  },
  { key: "tax",       label: "TAX %",    width: 70  },
  { key: "clearing",  label: "Clearing", width: 90  },
  { key: "wh",        label: "WH %",     width: 70  },
  { key: "landed",    label: "Landed/U", width: 100 },
  { key: "remove",    label: "",         width: 36  },
]

interface PoItemsSectionProps {
  control:      Control<PoCreateFormValues>
  setValue:     UseFormSetValue<PoCreateFormValues>
  fields:       UseFieldArrayReturn<PoCreateFormValues, "items">["fields"]
  remove:       UseFieldArrayReturn<PoCreateFormValues, "items">["remove"]
  onAddProduct: () => void
}

export default function PoItemsSection({
  control,
  setValue,
  fields,
  remove,
  onAddProduct,
}: PoItemsSectionProps) {
  const exchangeRate = Number(useWatch({ control, name: "exchangeRate" }) ?? 1)

  return (
    <SectionCard>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <SectionTitle>Products · Cost Model *</SectionTitle>
        {fields.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddProduct}
            sx={{ fontWeight: 600, fontSize: "0.82rem", mb: 2 }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {fields.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 36, color: "text.disabled" }} />}
          message="No products added yet"
          action={
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onAddProduct} sx={{ mt: 0.5, fontWeight: 600 }}>
              Add Product
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            rows={[]}
            columns={COLUMNS}
            total={0}
            page={0}
            pageSize={fields.length}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            noPagination
            customBody={fields.map((field, index) => (
              <PoItemRow
                key={field.id}
                index={index}
                control={control}
                setValue={setValue}
                exchangeRate={exchangeRate}
                onRemove={() => remove(index)}
              />
            ))}
          />

          <PoTotalsSummary control={control} exchangeRate={exchangeRate} />
        </>
      )}
    </SectionCard>
  )
}
