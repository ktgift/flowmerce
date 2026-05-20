import { db }         from "../../db"
import { mailTokens } from "../../db/schema"
import { eq }         from "drizzle-orm"
import type { TokenRecord } from "./model"
import type { MailToken }   from "../../../../shared/types"

export const authRepository = {

  async upsert(token: MailToken): Promise<void> {
    const id = `${token.sessionId}:${token.provider}`
    await db.insert(mailTokens)
      .values({ id, ...token })
      .onConflictDoUpdate({
        target: mailTokens.id,
        set: {
          accessToken:  token.accessToken,
          refreshToken: token.refreshToken,
          expiresAt:    token.expiresAt,
          email:        token.email,
        },
      })
  },

  async findOne(sessionId: string, provider: string): Promise<TokenRecord | null> {
    return await db.query.mailTokens.findFirst({
      where: eq(mailTokens.id, `${sessionId}:${provider}`),
    }) ?? null
  },

  async findBySession(sessionId: string): Promise<TokenRecord[]> {
    return db.query.mailTokens.findMany({
      where: eq(mailTokens.sessionId, sessionId),
    })
  },

  async updateTokens(sessionId: string, provider: string, accessToken: string, expiresAt: number): Promise<void> {
    await db.update(mailTokens)
      .set({ accessToken, expiresAt })
      .where(eq(mailTokens.id, `${sessionId}:${provider}`))
  },

  async delete(sessionId: string, provider: string): Promise<void> {
    await db.delete(mailTokens)
      .where(eq(mailTokens.id, `${sessionId}:${provider}`))
  },
}