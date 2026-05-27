import { useQuery, useMutation } from "@tanstack/react-query"
import type { UseQueryOptions, UseMutationOptions, QueryKey } from "@tanstack/react-query"

import type { ErrorResponse } from "shared/errors"
import type { ApiResponse }   from "@/lib/@types/api"
import { getToken } from "@/lib/config/auth"
import { BASE_URL } from "@/lib/config/http"
import { api } from "./axios"

interface CrudEndpoints {
  list:   string
  create: string
  get:    (id: number) => string
  update: (id: number) => string
  delete: (id: number) => string
}

export function createCrudApi<TList, TDetail, TCreate, TUpdate>(
  ep: CrudEndpoints,
) {
  return {
    list:   (params?: Record<string, unknown>) =>
      api.get<ApiResponse<TList>>(ep.list, { params }).then((r) => r.data.data),
    get:    (id: number) =>
      api.get<ApiResponse<TDetail>>(ep.get(id)).then((r) => r.data.data),
    create: (body: TCreate) =>
      api.post<ApiResponse<TDetail>>(ep.create, body).then((r) => r.data.data),
    update: (id: number, body: TUpdate) =>
      api.put<ApiResponse<TDetail>>(ep.update(id), body).then((r) => r.data.data),
    remove: (id: number) =>
      api.delete<void>(ep.delete(id)).then((r) => r.data),
  }
}

export function createQueryHook<TData, TParams = void>(
  fetcher: (params: TParams) => Promise<TData>,
  baseKey: QueryKey,
) {
  return (
    params: TParams,
    options?: Omit<UseQueryOptions<TData, ErrorResponse>, "queryKey" | "queryFn">,
  ) =>
    useQuery<TData, ErrorResponse>({
      queryKey: [...(baseKey as unknown[]), params] as QueryKey,
      queryFn:  () => fetcher(params),
      ...options,
    })
}

export function createMutationHook<TData, TVariables>(
  mutFn: (vars: TVariables) => Promise<TData>,
  defaults?: UseMutationOptions<TData, ErrorResponse, TVariables>,
) {
  return (overrides?: UseMutationOptions<TData, ErrorResponse, TVariables>) =>
    useMutation<TData, ErrorResponse, TVariables>({
      mutationFn: mutFn,
      ...defaults,
      ...overrides,
    })
}

export async function apiStream(
  url: string,
  body: unknown,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${url}`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok || !res.body) {
    const err: ErrorResponse = {
      success: false,
      code:    "INTERNAL_ERROR",
      message: `Stream error ${res.status}`,
    }
    throw err
  }

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}
