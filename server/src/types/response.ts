export interface SuccessResponse<T = undefined> {
  success: true
  data?: T
}

export interface ErrorEnvelope {
  success: false
  code:    string
  message: string
  details?: Record<string, unknown>
}

export type ApiResponse<T = undefined> = SuccessResponse<T> | ErrorEnvelope
