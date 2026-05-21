import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { ErrorResponse } from "shared/errors"
import { QK } from "@/lib/constants/queryKeys"
import { endpoints } from "@/lib/config/endpoints"
import { api } from "./axios"
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
} from "@/lib/@types/po"

// ─── Queries ──────────────────────────────────────────────────────

export function usePoList(
  filter: PoFilter = {},
  options?: Omit<UseQueryOptions<PoListItem[], ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<PoListItem[], ErrorResponse>({
    queryKey: [QK.purchaseOrders, "list", filter],
    queryFn:  () =>
      api.get<PoListItem[]>(endpoints.purchaseOrder.list, { params: filter }).then((r) => r.data),
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
      api.get<PoDetail>(endpoints.purchaseOrder.get(id)).then((r) => r.data),
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
      api.get<PoHistoryEntry[]>(endpoints.purchaseOrder.history(id)).then((r) => r.data),
    enabled: !!id,
    ...options,
  })
}

// ─── Mutations ────────────────────────────────────────────────────

export function useCreatePo() {
  const qc = useQueryClient()
  return useMutation<PoDetail, ErrorResponse, CreatePoInput>({
    mutationFn: (body) =>
      api.post<PoDetail>(endpoints.purchaseOrder.create, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] })
    },
  })
}

export function useCreatePoFromQuotation(quotationId: number) {
  const qc = useQueryClient()
  return useMutation<PoDetail, ErrorResponse, Omit<CreatePoInput, "items">>({
    mutationFn: (body) =>
      api
        .post<PoDetail>(endpoints.purchaseOrder.fromQuotation(quotationId), body)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] })
    },
  })
}

export function useUpdatePo(id: number) {
  const qc = useQueryClient()
  return useMutation<PoDetail, ErrorResponse, UpdatePoInput>({
    mutationFn: (body) =>
      api.patch<PoDetail>(endpoints.purchaseOrder.update(id), body).then((r) => r.data),
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
      api
        .patch<PoDetail>(endpoints.purchaseOrder.updateStatus(id), body)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "detail", id] })
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "list"] })
    },
  })
}

export function useReceivePo(id: number) {
  const qc = useQueryClient()
  return useMutation<Receipt, ErrorResponse, CreateReceiptInput>({
    mutationFn: (body) =>
      api
        .post<Receipt>(endpoints.purchaseOrder.receipts(id), body)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "detail", id] })
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders, "list"] })
    },
  })
}

export function useDeletePo(id: number) {
  const qc = useQueryClient()
  return useMutation<void, ErrorResponse, void>({
    mutationFn: () =>
      api.delete<void>(endpoints.purchaseOrder.delete(id)).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] })
    },
  })
}
