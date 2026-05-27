import { Elysia }     from "elysia"
import { verifyJwt } from "../lib/jwt"
import { Errors }    from "../lib/errors"
import type { UserRole } from "../modules/users/model"

const IS_DEV = process.env.NODE_ENV !== "production"

// Elysia plugin — reads Bearer token, injects userId / userRole / userName
export const authMiddleware = new Elysia({ name: "auth" })
  .derive({ as: "global" }, async ({ request }) => {
    if (IS_DEV) {
      return { userId: "1", userRole: "admin" as UserRole, userName: "Dev User" }
    }

    const authorization = request.headers.get("Authorization")
    if (!authorization?.startsWith("Bearer ")) throw Errors.AUTH_REQUIRED()

    const token = authorization.slice(7)
    try {
      const payload = await verifyJwt(token)
      return {
        userId:   payload.sub,
        userRole: payload.role as UserRole,
        userName: payload.name,
      }
    } catch {
      throw Errors.INVALID_TOKEN()
    }
  })

// Helper — call inside a handler to enforce role
export function assertRole(userRole: UserRole, ...allowed: UserRole[]): void {
  if (!allowed.includes(userRole)) throw Errors.FORBIDDEN()
}
