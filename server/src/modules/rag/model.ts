// DB record — embedding เป็น JSON string เหมือนใน SQLite
export interface ChunkRecord {
  id:         string
  sessionId:  string
  fileName:   string
  fileType:   string
  sheetName:  string | null
  rowStart:   number | null
  rowEnd:     number | null
  pageNumber: number | null
  chunkIndex: number | null
  content:    string
  preview:    string
  embedding:  string    // JSON: "[0.12, -0.87, ...]"
  createdAt:  string | null
}

// domain object — embedding เป็น number[] พร้อมใช้งาน
export interface ChunkDomain {
  id:          string
  sessionId:   string
  fileName:    string
  fileType:    string
  sheetName?:  string
  rowStart?:   number
  rowEnd?:     number
  pageNumber?: number
  chunkIndex:  number
  content:     string
  preview:     string
  embedding:   number[]
}

// scored chunk สำหรับ RAG ranking
export interface ScoredChunk extends ChunkDomain {
  score: number
}

// input สำหรับ insert ใหม่
export type NewChunk = Omit<ChunkDomain, "id"> & { id: string }