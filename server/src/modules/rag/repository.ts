import { db }        from "../../db"
import { fileChunks } from "../../db/schema"
import { eq }        from "drizzle-orm"
import type { ChunkRecord, NewChunk } from "./model"

export const chunkRepository = {

  async insertMany(chunks: NewChunk[]): Promise<void> {
    const records = chunks.map(c => ({
      id:         c.id,
      sessionId:  c.sessionId,
      fileName:   c.fileName,
      fileType:   c.fileType,
      sheetName:  c.sheetName ?? null,
      rowStart:   c.rowStart ?? null,
      rowEnd:     c.rowEnd ?? null,
      pageNumber: c.pageNumber ?? null,
      chunkIndex: c.chunkIndex,
      content:    c.content,
      preview:    c.preview,
      embedding:  JSON.stringify(c.embedding),
    }))
    // batch insert ครั้งละ 50 เพื่อไม่ให้ SQLite timeout
    const BATCH = 50
    for (let i = 0; i < records.length; i += BATCH) {
      await db.insert(fileChunks).values(records.slice(i, i + BATCH))
    }
  },

  async findBySession(sessionId: string): Promise<ChunkRecord[]> {
    return db.query.fileChunks.findMany({
      where: eq(fileChunks.sessionId, sessionId),
    })
  },

  async deleteBySession(sessionId: string): Promise<void> {
    await db.delete(fileChunks).where(eq(fileChunks.sessionId, sessionId))
  },

  async countBySession(sessionId: string): Promise<number> {
    const rows = await db.query.fileChunks.findMany({
      where:   eq(fileChunks.sessionId, sessionId),
      columns: { id: true },
    })
    return rows.length
  },

  async findDistinctSessions(): Promise<{ sessionId: string; fileName: string; createdAt: string | null }[]> {
    return db.query.fileChunks.findMany({
      columns:  { sessionId: true, fileName: true, createdAt: true },
      orderBy:  (t, { desc }) => [desc(t.createdAt)],
    })
  },
}