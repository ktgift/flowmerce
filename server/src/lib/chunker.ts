import type { ParsedSection } from "./parser"

export interface Chunk {
  content:     string
  preview:     string
  chunkIndex:  number
  sheetName?:  string
  rowStart?:   number
  rowEnd?:     number
  pageNumber?: number
}

const MAX_CHUNK_SIZE = 500
const OVERLAP        = 50

export function chunkSections(sections: ParsedSection[]): Chunk[] {
  return sections.flatMap((section, sectionIndex) =>
    chunkText(section.content, {
      sheetName:  section.sheetName,
      rowStart:   section.rowStart,
      rowEnd:     section.rowEnd,
      pageNumber: section.pageNumber,
    }, sectionIndex * 100)
  )
}

function chunkText(
  content: string,
  metadata: Omit<Chunk, "content" | "preview" | "chunkIndex">,
  startIndex: number
): Chunk[] {
  if (content.length <= MAX_CHUNK_SIZE) {
    return [{
      content,
      preview:    content.slice(0, 150),
      chunkIndex: startIndex,
      ...metadata,
    }]
  }

  const chunks: Chunk[] = []
  let start = 0
  let idx   = startIndex

  while (start < content.length) {
    let end = start + MAX_CHUNK_SIZE
    if (end < content.length) {
      const spaceIdx = content.lastIndexOf(" ", end)
      if (spaceIdx > start) end = spaceIdx
    }
    const text = content.slice(start, end).trim()
    if (text) {
      chunks.push({ content: text, preview: text.slice(0, 150), chunkIndex: idx++, ...metadata })
    }
    start = end - OVERLAP
  }
  return chunks
}