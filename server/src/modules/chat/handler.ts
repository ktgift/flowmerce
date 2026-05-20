import { Elysia, t }   from "elysia"
import { chatService } from "./service"

const handler = {

  // คืน ReadableStream สำหรับ SSE
  createStream(sessionId: string, question: string): ReadableStream {
    return new ReadableStream({
      async start(controller) {
        const enc = (data: object) =>
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))

        const result = await chatService.streamAnswer(
          sessionId,
          question,
          token => enc({ type: "token", token })
        )

        if ("error" in result) {
          enc({ type: "error", message: result.error })
        } else {
          // ส่ง sources ก่อน token แรก
          enc({ type: "sources", sources: result.sources })
        }

        enc({ type: "done" })
        controller.close()
      }
    })
  },
}

export const chatRoute = new Elysia()

  .post("/chat/ask", ({ body, set }) => {
    set.headers["Content-Type"]  = "text/event-stream"
    set.headers["Cache-Control"] = "no-cache"
    set.headers["Connection"]    = "keep-alive"
    return new Response(handler.createStream(body.sessionId, body.question))
  }, {
    body: t.Object({
      sessionId: t.String(),
      question:  t.String(),
    })
  })
