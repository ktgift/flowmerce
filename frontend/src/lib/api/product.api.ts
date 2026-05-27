import { useQuery }             from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { ErrorResponse }   from "shared/errors"
import type { ApiResponse }     from "@/lib/@types/api"
import { endpoints }            from "@/lib/config/endpoints"
import { api }                  from "./axios"
import type { ProductListItem } from "@/lib/@types/product"

export function useProductList(
  options?: Omit<UseQueryOptions<ProductListItem[], ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<ProductListItem[], ErrorResponse>({
    queryKey: ["products", "list"],
    queryFn:  () =>
      api.get<ApiResponse<ProductListItem[]>>(endpoints.product.list)
        .then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}
