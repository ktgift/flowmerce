import type { UserRole } from "../../../../shared/types"

export type { UserRole }

export const USER_ROLES: UserRole[] = [
  "admin",
  "procurement_manager",
  "sales",
  "warehouse",
  "viewer",
]

export interface UserRecord {
  id:        number
  tenantId:  number
  name:      string
  email:     string
  role:      UserRole
  isActive:  boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateUserInput {
  name:     string
  email:    string
  password: string
  role:     UserRole
}

export interface UpdateUserInput {
  name?:     string
  role?:     UserRole
  isActive?: boolean
}

export interface LoginInput {
  email:    string
  password: string
}

export interface AuthPayload {
  token:     string
  expiresAt: number
  user: {
    id:    number
    name:  string
    email: string
    role:  UserRole
  }
}
