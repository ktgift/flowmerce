import { useQuery }             from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { ErrorResponse }    from "shared/errors"
import type { ApiResponse }      from "@/lib/@types/api"
import { QK }                    from "@/lib/constants/queryKeys"
import { endpoints }             from "@/lib/config/endpoints"
import { api }                   from "./axios"
import type { SupplierListItem, SupplierOption, SupplierDetail } from "@/lib/@types/supplier"

export function useSupplierList(
  options?: Omit<UseQueryOptions<SupplierListItem[], ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<SupplierListItem[], ErrorResponse>({
    queryKey: [QK.suppliers, "list"],
    queryFn:  () =>
      api.get<ApiResponse<SupplierListItem[]>>(endpoints.supplier.list)
        .then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useSupplierOptions(
  options?: Omit<UseQueryOptions<SupplierOption[], ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<SupplierOption[], ErrorResponse>({
    queryKey: [QK.suppliers, "options"],
    queryFn:  () =>
      api.get<ApiResponse<SupplierOption[]>>(endpoints.supplier.options)
        .then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

export function useSupplier(
  id: number | undefined,
  options?: Omit<UseQueryOptions<SupplierDetail, ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<SupplierDetail, ErrorResponse>({
    queryKey: [QK.suppliers, "detail", id],
    queryFn:  () =>
      api.get<ApiResponse<SupplierDetail>>(endpoints.supplier.get(id!))
        .then((r) => r.data.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}
