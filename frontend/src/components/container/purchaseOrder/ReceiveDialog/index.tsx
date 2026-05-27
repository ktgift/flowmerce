import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Box             from "@mui/material/Box"
import Button          from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Divider         from "@mui/material/Divider"
import Typography      from "@mui/material/Typography"

import { receiptCreateSchema, type ReceiptCreateFormValues } from "@/lib/schema/po.schema"
import { useReceivePo }              from "@/lib/api/po.api"
import { buildReceiptDefaultValues } from "@/lib/constants/po"
import { useModal }                  from "@/lib/hook/useModal"
import { useSnackbar }               from "@/lib/hook/useSnackbar"
import type { ReceiveItem }          from "@/lib/@types/po"

import ReceiveHeaderFields from "./ReceiveHeaderFields"
import ReceiveItemRow      from "./ReceiveItemRow"

interface ReceiveDialogBodyProps {
  poId:  number
  items: ReceiveItem[]
}

export default function ReceiveDialogBody({ poId, items }: ReceiveDialogBodyProps) {
  const { closeModal }       = useModal()
  const { success, error }   = useSnackbar()
  const receivePo            = useReceivePo(poId)

  const { control, handleSubmit, reset } = useForm<ReceiptCreateFormValues>({
    resolver:      zodResolver(receiptCreateSchema),
    defaultValues: buildReceiptDefaultValues(items),
  })

  const { fields } = useFieldArray({ control, name: "items" })

  const handleClose = () => {
    reset(buildReceiptDefaultValues(items))
    closeModal()
  }

  const onSubmit = async (values: ReceiptCreateFormValues) => {
    try {
      await receivePo.mutateAsync(values)
      success("Goods receipt recorded.")
      closeModal()
    } catch {
      error("Failed to record receipt.")
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

      {/* Scrollable content */}
      <Box
        sx={{
          flex:      1,
          minHeight: 0,
          overflowY: "auto",
          px:        2.5,
          py:        2,
          "&::-webkit-scrollbar":       { width: 5 },
          "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "grey.300" },
        }}
      >
        <ReceiveHeaderFields control={control} />

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          Items to Receive
        </Typography>

        {fields.map((field, index) => (
          <ReceiveItemRow
            key={field.id}
            control={control}
            index={index}
            item={items[index]}
          />
        ))}

        {fields.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No items remaining to receive.
          </Typography>
        )}
      </Box>

      {/* Sticky footer */}
      <Box
        sx={{
          px:          2.5,
          pt:          2,
          pb:          3,
          flexShrink:  0,
          borderTop:   "1px solid",
          borderColor: "divider",
          bgcolor:     "background.paper",
          display:     "flex",
          gap:         1.5,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={receivePo.isPending}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="success"
          disabled={receivePo.isPending}
          onClick={handleSubmit(onSubmit)}
          startIcon={
            receivePo.isPending
              ? <CircularProgress size={14} color="inherit" />
              : undefined
          }
        >
          {receivePo.isPending ? "Submitting…" : "Submit Receipt"}
        </Button>
      </Box>
    </Box>
  )
}
