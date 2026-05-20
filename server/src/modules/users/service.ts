import { usersRepository }    from "./repository"
import { signJwt }            from "../../lib/jwt"
import { Errors }             from "../../lib/errors"
import type { CreateUserInput, LoginInput, UpdateUserInput } from "./model"

const TOKEN_TTL_HOURS = 24

export const usersService = {

  async login(tenantId: number, input: LoginInput) {
    const user = await usersRepository.findByEmail(tenantId, input.email)
    if (!user || !user.isActive) throw Errors.INVALID_CREDENTIALS()

    const valid = await Bun.password.verify(input.password, user.passwordHash)
    if (!valid) throw Errors.INVALID_CREDENTIALS()

    const token = await signJwt({
      sub:   user.id,
      tid:   tenantId,
      role:  user.role,
      name:  user.name,
      email: user.email,
    }, TOKEN_TTL_HOURS)

    return {
      token,
      expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_HOURS * 3_600,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role as string,
      },
    }
  },

  async create(tenantId: number, input: CreateUserInput) {
    const existing = await usersRepository.findByEmail(tenantId, input.email)
    if (existing) throw Errors.USER_ALREADY_EXISTS()

    const passwordHash = await Bun.password.hash(input.password)
    const row = await usersRepository.create(tenantId, {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    })
    // strip passwordHash before returning
    const { passwordHash: _ph, ...safe } = row
    return safe
  },

  async list(tenantId: number) {
    return usersRepository.findAll(tenantId)
  },

  async getById(tenantId: number, id: number) {
    const user = await usersRepository.findById(tenantId, id)
    if (!user) throw Errors.USER_NOT_FOUND()
    return user
  },

  async update(tenantId: number, id: number, input: UpdateUserInput) {
    const exists = await usersRepository.findById(tenantId, id)
    if (!exists) throw Errors.USER_NOT_FOUND()
    const updated = await usersRepository.update(tenantId, id, input)
    if (!updated) throw Errors.USER_NOT_FOUND()
    return updated
  },
}
