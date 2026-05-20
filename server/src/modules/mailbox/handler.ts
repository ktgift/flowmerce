import { Elysia, t }      from "elysia"
import { mailboxService } from "./service"

const handler = {

  async handleFetch(sessionId: string, provider: "gmail" | "outlook") {
    return mailboxService.fetchAndDraft(sessionId, provider)
  },

  async handleList(sessionId: string) {
    return mailboxService.listEmails(sessionId)
  },

  async handleUpdateDraft(draftId: string, draftBody: string) {
    await mailboxService.updateDraft(draftId, draftBody)
    return { ok: true }
  },

  async handleSend(sessionId: string, draftId: string) {
    const result = await mailboxService.sendMail(sessionId, draftId)
    return { ok: true, sentTo: result.sentTo }
  },

  async handleDiscard(draftId: string) {
    await mailboxService.discardDraft(draftId)
    return { ok: true }
  },
}

export const mailboxRoute = new Elysia()

  .post("/mailbox/fetch", ({ body }) =>
    handler.handleFetch(body.sessionId, body.provider),
  {
    body: t.Object({
      sessionId: t.String(),
      provider:  t.Union([t.Literal("gmail"), t.Literal("outlook")]),
    })
  })

  .get("/mailbox/list", ({ query }) =>
    handler.handleList(query.sessionId),
  {
    query: t.Object({ sessionId: t.String() })
  })

  .patch("/mailbox/draft/:draftId", ({ params, body }) =>
    handler.handleUpdateDraft(params.draftId, body.draftBody),
  {
    body: t.Object({ draftBody: t.String() })
  })

  .post("/mailbox/send/:draftId", ({ params, query }) =>
    handler.handleSend(query.sessionId, params.draftId),
  {
    query: t.Object({ sessionId: t.String() })
  })

  .patch("/mailbox/draft/:draftId/discard", ({ params }) =>
    handler.handleDiscard(params.draftId)
  )
