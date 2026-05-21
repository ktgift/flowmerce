import type { UserRole } from "shared"

export interface User {
  id:       number
  email:    string
  name:     string
  role:     UserRole
  tenantId: number
}

export interface LoginResponse {
  token: string
  user:  User
}

export interface RefreshResponse {
  token: string
}
