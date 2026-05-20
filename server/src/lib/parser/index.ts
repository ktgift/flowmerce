import path from "path"
import { parseExcel } from "./excel.parser"
import { parsePdf }   from "./pdf.parser"
import { parseDocx }  from "./docx.parser"

export interface ParsedSection {
  content:     string
  sheetName?:  string
  rowStart?:   number
  rowEnd?:     number
  pageNumber?: number
}

export async function parseFile(filePath: string): Promise<ParsedSection[]> {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case ".xlsx":
    case ".xls":  return parseExcel(filePath)
    case ".pdf":  return parsePdf(filePath)
    case ".docx":
    case ".doc":  return parseDocx(filePath)
    case ".csv":  return parseCsv(filePath)
    default:
      console.warn(`[parser] unsupported extension: ${ext}`)
      return []
  }
}

async function parseCsv(filePath: string): Promise<ParsedSection[]> {
  const text    = await Bun.file(filePath).text()
  const lines   = text.split("\n").filter(l => l.trim())
  const headers = lines[0].split(",")
  return lines.slice(1).map((line, i) => {
    const values  = line.split(",")
    const content = headers
      .map((h, j) => `${h.trim()}: ${values[j]?.trim() ?? ""}`)
      .join(" | ")
    return { content, rowStart: i + 2, rowEnd: i + 2 }
  })
}