import { Elysia, t }    from "elysia"
import { emailService } from "./service"

const handler = {

  createStream(
    sessionId:    string,
    emailContent: string,
    tone:         "formal" | "friendly" | "brief",
    language:     "th" | "en"
  ): ReadableStream {
    return new ReadableStream({
      async start(controller) {
        const enc = (data: object) =>
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))

        await emailService.streamReply(
          sessionId, emailContent, tone, language,
          token => enc({ type: "token", token })
        )

        enc({ type: "done" })
        controller.close()
      }
    })
  },
}

export const emailRoute = new Elysia()

  .post("/email/reply", ({ body, set }) => {
    set.headers["Content-Type"]  = "text/event-stream"
    set.headers["Cache-Control"] = "no-cache"
    set.headers["Connection"]    = "keep-alive"
    return new Response(
      handler.createStream(body.sessionId, body.emailContent, body.tone, body.language)
    )
  }, {
    body: t.Object({
      sessionId:    t.String(),
      emailContent: t.String(),
      tone:         t.Union([t.Literal("formal"), t.Literal("friendly"), t.Literal("brief")]),
      language:     t.Union([t.Literal("th"), t.Literal("en")]),
    })
  })
