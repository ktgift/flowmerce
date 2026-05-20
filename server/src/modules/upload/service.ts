import { parseFile }     from "../../lib/parser"
import { chunkSections } from "../../lib/chunker"
import { embedBatch }    from "../../lib/embedder"
import { chunkRepository } from "../rag/repository"
import { randomUUID }    from "crypto"
import type { NewChunk } from "../rag/model"
import path from "path"

export const uploadService = {

  async processFile(
    sessionId: string,
    filePath:  string,
    fileName:  string
  ): Promise<{ fileName: string; chunks: number }> {

    // 1. parse
    const sections = await parseFile(filePath)
    if (sections.length === 0) return { fileName, chunks: 0 }

    // 2. chunk
    const chunks = chunkSections(sections)

    // 3. embed
    const embeddings = await embedBatch(chunks.map(c => c.content))

    // 4. build records
    const records: NewChunk[] = chunks.map((chunk, i) => ({
      id:         randomUUID(),
      sessionId,
      fileName,
      fileType:   path.extname(fileName).slice(1).toLowerCase(),
      sheetName:  chunk.sheetName,
      rowStart:   chunk.rowStart,
      rowEnd:     chunk.rowEnd,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      content:    chunk.content,
      preview:    chunk.preview,
      embedding:  embeddings[i],
    }))

    // 5. save via repository
    await chunkRepository.insertMany(records)

    return { fileName, chunks: records.length }
  },

  async getSessionStats(sessionId: string) {
    const rows  = await chunkRepository.findDistinctSessions()
    const files = [...new Set(
      rows.filter(r => r.sessionId === sessionId).map(r => r.fileName)
    )]
    const totalChunks = await chunkRepository.countBySession(sessionId)
    return { totalChunks, files }
  },

  async listSessions() {
    const rows = await chunkRepository.findDistinctSessions()
    const seen = new Map<string, { sessionId: string; files: string[]; createdAt: string }>()
    for (const row of rows) {
      if (!seen.has(row.sessionId)) {
        seen.set(row.sessionId, {
          sessionId: row.sessionId,
          files:     [],
          createdAt: row.createdAt ?? "",
        })
      }
      const s = seen.get(row.sessionId)!
      if (!s.files.includes(row.fileName)) s.files.push(row.fileName)
    }
    return [...seen.values()]
  },

  async clearSession(sessionId: string): Promise<void> {
    await chunkRepository.deleteBySession(sessionId)
  },
}