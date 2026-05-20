import { Elysia }     from "elysia"
import { verifyJwt } from "../lib/jwt"
import { Errors }    from "../lib/errors"
import type { UserRole } from "../modules/users/model"

// Elysia plugin — reads Bearer token, injects userId / userRole / userName
export const authMiddleware = new Elysia({ name: "auth" })
  .derive({ as: "global" }, async ({ request }) => {
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
