import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"

import type { ErrorResponse } from "shared/errors"
import { getToken, clearToken } from "@/lib/config/auth"
import { BASE_URL, TIMEOUT } from "@/lib/config/http"
import { useLoaderStore } from "@/lib/services/loaderService"

export function createInstance(baseURL: string = BASE_URL, { withLoader = true } = {}) {
  const instance = axios.create({ baseURL, timeout: TIMEOUT })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (withLoader) useLoaderStore.getState().inc()
    return config
  })

  instance.interceptors.response.use(
    (res) => {
      if (withLoader) useLoaderStore.getState().dec()
      return res
    },
    (err: AxiosError<ErrorResponse>) => {
      if (withLoader) useLoaderStore.getState().dec()

      if (err.response?.status === 401) {
        clearToken()
        window.location.href = "/login"
        return Promise.reject(err)
      }

      const data = err.response?.data
      if (data && data.ok === false) {
        return Promise.reject(data)
      }

      const fallback: ErrorResponse = {
        ok: false,
        code: "INTERNAL_ERROR",
        message: err.message ?? "Unknown error",
      }
      return Promise.reject(fallback)
    },
  )

  return instance
}

export const api = createInstance()
export const silentApi = createInstance(BASE_URL, { withLoader: false })
