import type { ErrorResponse } from "shared/errors"

export interface ApiResponse<T> {
  success: true
  data:    T
}

export type ApiResult<T> = ApiResponse<T> | ErrorResponse

export type ApiError = ErrorResponse

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page:  number
  limit: number
}

export interface ListParams {
  page?:   number
  limit?:  number
  sort?:   string
  search?: string
}
