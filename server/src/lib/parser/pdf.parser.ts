import { PDFParse } from "pdf-parse"
import fs from "fs"
import type { ParsedSection } from "./index"

export async function parsePdf(filePath: string): Promise<ParsedSection[]> {
  const buffer = fs.readFileSync(filePath)
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  const sections: ParsedSection[] = result.pages
    .map((page, idx) => ({
      content: page.text.trim(),
      pageNumber: idx + 1,
    }))
    .filter((s) => s.content.length > 0)

  await parser.destroy()
  return sections
}