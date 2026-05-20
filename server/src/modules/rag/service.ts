import { embedText, cosineSimilarity } from "../../lib/embedder"
import { chunkRepository }              from "./repository"
import type { ScoredChunk }             from "./model"
import type { SourceRef }               from "../../../../shared/types"

export const ragService = {

  async findRelevantChunks(
    sessionId: string,
    query:     string,
    options: {
      topPerFile: number
      maxTotal:   number
      minScore:   number
    } = { topPerFile: 2, maxTotal: 8, minScore: 0.5 }
  ): Promise<ScoredChunk[]> {

    const queryVector = await embedText(query)
    const rows        = await chunkRepository.findBySession(sessionId)

    if (rows.length === 0) return []

    // score ทุก chunk
    const scored: ScoredChunk[] = rows.map(row => ({
      id:         row.id,
      sessionId:  row.sessionId,
      fileName:   row.fileName,
      fileType:   row.fileType,
      sheetName:  row.sheetName  ?? undefined,
      rowStart:   row.rowStart   ?? undefined,
      rowEnd:     row.rowEnd     ?? undefined,
      pageNumber: row.pageNumber ?? undefined,
      chunkIndex: row.chunkIndex ?? 0,
      content:    row.content,
      preview:    row.preview,
      embedding:  JSON.parse(row.embedding) as number[],
      score:      cosineSimilarity(queryVector, JSON.parse(row.embedding) as number[]),
    })).sort((a, b) => b.score - a.score)

    // เลือก top chunks กระจายจากหลายไฟล์
    const countPerFile = new Map<string, number>()
    const selected: ScoredChunk[] = []

    for (const chunk of scored) {
      if (chunk.score < options.minScore) break
      if (selected.length >= options.maxTotal) break
      const count = countPerFile.get(chunk.fileName) ?? 0
      if (count >= options.topPerFile) continue
      selected.push(chunk)
      countPerFile.set(chunk.fileName, count + 1)
    }

    return selected
  },

  buildContext(chunks: ScoredChunk[]): string {
    return chunks.map((chunk, i) => {
      const loc = chunk.sheetName && chunk.rowStart
        ? `(Sheet: ${chunk.sheetName}, แถว ${chunk.rowStart})`
        : chunk.pageNumber ? `(หน้า ${chunk.pageNumber})` : ""
      return `[แหล่งที่มา ${i + 1}: ${chunk.fileName} ${loc}]\n${chunk.content}`
    }).join("\n\n")
  },

  toSourceRefs(chunks: ScoredChunk[]): SourceRef[] {
    return chunks.map(c => ({
      fileName:   c.fileName,
      fileType:   c.fileType,
      sheetName:  c.sheetName,
      rowStart:   c.rowStart,
      rowEnd:     c.rowEnd,
      pageNumber: c.pageNumber,
      preview:    c.preview,
      score:      Math.round(c.score * 100) / 100,
    }))
  },
}