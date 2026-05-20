import { authRepository } from "./repository"
import { getMailAdapter } from "../../lib/mail"
import type { MailToken, AuthStatus } from "../../../../shared/types"

export const authService = {

  async saveToken(token: MailToken): Promise<void> {
    await authRepository.upsert(token)
  },

  async getValidAccessToken(sessionId: string, provider: string): Promise<string> {
    const record = await authRepository.findOne(sessionId, provider)
    if (!record) throw new Error(`Not logged in to ${provider}`)

    // refresh if expiring in 5 minutes
    const isExpiringSoon = record.expiresAt - Math.floor(Date.now() / 1000) < 300
    if (isExpiringSoon && record.refreshToken) {
      const adapter   = getMailAdapter(provider as "gmail" | "outlook")
      const refreshed = await adapter.refreshToken(record.refreshToken)
      await authRepository.updateTokens(
        sessionId, provider,
        refreshed.accessToken, refreshed.expiresAt
      )
      return refreshed.accessToken
    }

    return record.accessToken
  },

  async listConnectedProviders(sessionId: string): Promise<AuthStatus[]> {
    const records = await authRepository.findBySession(sessionId)
    return records.map(r => ({ provider: r.provider, email: r.email }))
  },

  async logout(sessionId: string, provider: string): Promise<void> {
    await authRepository.delete(sessionId, provider)
  },
}