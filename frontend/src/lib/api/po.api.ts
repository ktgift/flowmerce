import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { ErrorResponse } from "shared/errors"
import type { ApiResponse }   from "@/lib/@types/api"
import { QK }                 from "@/lib/constants/queryKeys"
import { endpoints }          from "@/lib/config/endpoints"
import { api, silentApi }     from "./axios"
import type {
  PoFilter,
  PoListItem,
  PoDetail,
  PoHistoryEntry,
  Receipt,
  CreatePoInput,
  UpdatePoInput,
  PoStatus,
  CreateReceiptInput,
  PoSummary,
} from "@/lib/@types/po"

// ─── Queries ──────────────────────────────────────────────────────

export function usePoList(
  filter: PoFilter = {},
  options?: Omit<UseQueryOptions<PoListItem[], ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<PoListItem[], ErrorResponse>({
    queryKey: [QK.purchaseOrders, "list", filter],
    queryFn:  () =>
      api.get<ApiResponse<PoListItem[]>>(endpoints.purchaseOrder.list, { params: filter })
        .then((r) => r.data.data),
    ...options,
  })
}

export function usePo(
  id: number,
  options?: Omit<UseQueryOptions<PoDetail, ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<PoDetail, ErrorResponse>({
    queryKey: [QK.purchaseOrders, "detail", id],
    queryFn:  () =>
      api.get<ApiResponse<PoDetail>>(endpoints.purchaseOrder.get(id))
        .then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePoHistory(
  id: number,
  options?: Omit<UseQueryOptions<PoHistoryEntry[], ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<PoHistoryEntry[], ErrorResponse>({
    queryKey: [QK.purchaseOrders, "history", id],
    queryFn:  () =>
      api.get<ApiResponse<PoHistoryEntry[]>>(endpoints.purchaseOrder.history(id))
        .then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePoSummary(
  options?: Omit<UseQueryOptions<PoSummary, ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<PoSummary, ErrorResponse>({
    queryKey: [QK.purchaseOrders, "summary"],
    queryFn:  () =>
      api.get<ApiResponse<PoSummary>>(endpoints.purchaseOrder.summary)
        .then((r) => r.data.data),
    ...options,
  })
}

// ─── Mutations ────────────────────────────────────────────────────

export function useCreatePo() {
  const qc = useQueryClient()
  return useMutation<PoDetail, ErrorResponse, CreatePoInput>({
    mutationFn: (body) =>
      api.post<ApiResponse<PoDetail>>(endpoints.purchaseOrder.create, body)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] })
    },
  })
}

export function useCreatePoFromQuotation(quotationId: number) {
  const qc = useQueryClient()
  return useMutation<PoDetail, ErrorResponse, Omit<CreatePoInput, "items">>({
    mutationFn: (body) =>
      api.post<ApiResponse<PoDetail>>(endpoints.purchaseOrder.fromQuotation(quotationId), body)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] })
    },
  })
}

export function useUpdatePo(id: number) {
  const qc = useQueryClient()
  return useMutation<PoDetail, ErrorResponse, UpdatePoInput>({
    mutationFn: (body) =>
      api.patch<ApiResponse<PoDetail>>(endpoints.purchaseOrder.update(id), body)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "detail", id] })
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "list"] })
    },
  })
}

export function useChangePoStatus(id: number) {
  const qc = useQueryClient()
  return useMutation<
    PoDetail,
    ErrorResponse,
    { status: PoStatus; changedBy?: string; note?: string }
  >({
    mutationFn: (body) =>
      api.patch<ApiResponse<PoDetail>>(endpoints.purchaseOrder.updateStatus(id), body)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "detail", id] })
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "list"] })
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "summary"] })
    },
  })
}

export function useReceivePo(id: number) {
  const qc = useQueryClient()
  return useMutation<Receipt, ErrorResponse, CreateReceiptInput>({
    mutationFn: (body) =>
      api.post<ApiResponse<Receipt>>(endpoints.purchaseOrder.receipts(id), body)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "detail", id] })
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "list"] })
    },
  })
}

export function useDeletePo() {
  const qc = useQueryClient()
  return useMutation<void, ErrorResponse, number>({
    mutationFn: (id) =>
      api.delete<void>(endpoints.purchaseOrder.delete(id)).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] })
    },
  })
}

export async function downloadPoPdf(id: number, poNumber: string): Promise<void> {
  const res = await silentApi.get<Blob>(endpoints.purchaseOrder.pdf(id), { responseType: "blob" })
  const url = URL.createObjectURL(res.data)
  const a   = document.createElement("a")
  a.href     = url
  a.download = `${poNumber}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
