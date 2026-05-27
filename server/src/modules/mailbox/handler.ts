import { Elysia, t }      from "elysia"
import { mailboxService } from "./service"

export const mailboxRoute = new Elysia()

  .post("/mailbox/fetch", async ({ body }) => {
    const data = await mailboxService.fetchAndDraft(body.sessionId, body.provider)
    return { success: true, data }
  }, {
    body: t.Object({
      sessionId: t.String(),
      provider:  t.Union([t.Literal("gmail"), t.Literal("outlook")]),
    })
  })

  .get("/mailbox/list", async ({ query }) => {
    const data = await mailboxService.listEmails(query.sessionId)
    return { success: true, data }
  }, {
    query: t.Object({ sessionId: t.String() })
  })

  .patch("/mailbox/draft/:draftId", async ({ params, body }) => {
    await mailboxService.updateDraft(params.draftId, body.draftBody)
    return { success: true }
  }, {
    body: t.Object({ draftBody: t.String() })
  })

  .post("/mailbox/send/:draftId", async ({ params, query }) => {
    const result = await mailboxService.sendMail(query.sessionId, params.draftId)
    return { success: true, data: { sentTo: result.sentTo } }
  }, {
    query: t.Object({ sessionId: t.String() })
  })

  .patch("/mailbox/draft/:draftId/discard", async ({ params }) => {
    await mailboxService.discardDraft(params.draftId)
    return { success: true }
  })
