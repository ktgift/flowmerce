import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UseMutationOptions } from "@tanstack/react-query"

import type { ErrorResponse } from "shared/errors"
import type { LoginInput } from "@/lib/schema/auth"
import type { User, LoginResponse, RefreshResponse } from "@/lib/@types/auth"
import { getToken, setToken, clearToken } from "@/lib/config/auth"
import { endpoints } from "@/lib/config/endpoints"
import { QK } from "@/lib/constants/queryKeys"
import { useAuthStore } from "@/lib/store/authStore"
import { api, silentApi } from "./axios"

const AUTH_KEY = [QK.auth, "me"] as const

export function useLogin(
  options?: UseMutationOptions<LoginResponse, ErrorResponse, LoginInput>,
) {
  const setUser = useAuthStore((s) => s.setUser)
  const qc      = useQueryClient()

  return useMutation<LoginResponse, ErrorResponse, LoginInput>({
    mutationFn: (body) =>
      api.post<LoginResponse>(endpoints.auth.login, body).then((r) => r.data),
    ...options,
    onSuccess: (data, vars, onMutateResult, ctx) => {
      setToken(data.token)
      setUser(data.user)
      qc.setQueryData(AUTH_KEY, data.user)
      options?.onSuccess?.(data, vars, onMutateResult, ctx)
    },
  })
}

export function useLogout(
  options?: UseMutationOptions<void, ErrorResponse, void>,
) {
  const clearUser = useAuthStore((s) => s.clearUser)
  const qc        = useQueryClient()

  return useMutation<void, ErrorResponse, void>({
    mutationFn: () =>
      api.post<void>(endpoints.auth.logout).then((r) => r.data),
    ...options,
    onSuccess: (data, vars, onMutateResult, ctx) => {
      clearToken()
      clearUser()
      qc.removeQueries({ queryKey: AUTH_KEY })
      options?.onSuccess?.(data, vars, onMutateResult, ctx)
    },
    onError: (err, vars, onMutateResult, ctx) => {
      clearToken()
      clearUser()
      qc.removeQueries({ queryKey: AUTH_KEY })
      options?.onError?.(err, vars, onMutateResult, ctx)
    },
  })
}

export function useMe() {
  const token = getToken()

  return useQuery<User, ErrorResponse>({
    queryKey: AUTH_KEY,
    queryFn:  () =>
      silentApi.get<User>(endpoints.auth.me).then((r) => r.data),
    enabled:  !!token,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRefresh(
  options?: UseMutationOptions<RefreshResponse, ErrorResponse, void>,
) {
  const qc = useQueryClient()

  return useMutation<RefreshResponse, ErrorResponse, void>({
    mutationFn: () =>
      silentApi.post<RefreshResponse>(endpoints.auth.refresh).then((r) => r.data),
    ...options,
    onSuccess: (data, vars, onMutateResult, ctx) => {
      setToken(data.token)
      qc.invalidateQueries({ queryKey: AUTH_KEY })
      options?.onSuccess?.(data, vars, onMutateResult, ctx)
    },
  })
}
