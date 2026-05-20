import { Elysia, t }     from "elysia"
import { uploadService } from "./service"
import path  from "path"
import fs    from "fs"
import os    from "os"
import { randomUUID } from "crypto"

const handler = {

  async handleUpload(sessionId: string, files: File[]) {
    const results: { fileName: string; chunks: number }[] = []

    for (const file of files) {
      // เขียน temp file เพื่อให้ parser อ่านได้
      const tmpPath = path.join(os.tmpdir(), `rag-${randomUUID()}-${file.name}`)
      await Bun.write(tmpPath, await file.arrayBuffer())

      try {
        const result = await uploadService.processFile(sessionId, tmpPath, file.name)
        if (result.chunks > 0) results.push(result)
      } finally {
        fs.unlink(tmpPath, () => {})  // ลบ temp file ทันที
      }
    }

    const stats = await uploadService.getSessionStats(sessionId)
    return { sessionId, uploaded: results, ...stats }
  },

  async handleGetStats(sessionId: string) {
    return uploadService.getSessionStats(sessionId)
  },

  async handleListSessions() {
    return uploadService.listSessions()
  },

  async handleClearSession(sessionId: string) {
    await uploadService.clearSession(sessionId)
    return { deleted: true }
  },
}

export const uploadRoute = new Elysia()

  .post("/upload", async ({ body }) =>
    handler.handleUpload(body.sessionId, body.files),
  {
    body: t.Object({
      sessionId: t.String(),
      files:     t.Files(),
    })
  })

  .get("/sessions", () =>
    handler.handleListSessions()
  )

  .get("/session/:sessionId/stats", ({ params }) =>
    handler.handleGetStats(params.sessionId)
  )

  .delete("/session/:sessionId", ({ params }) =>
    handler.handleClearSession(params.sessionId)
  )
