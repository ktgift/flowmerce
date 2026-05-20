import mammoth from "mammoth"
import type { ParsedSection } from "./index"

export async function parseDocx(filePath: string): Promise<ParsedSection[]> {
  const { value } = await mammoth.extractRawText({ path: filePath })
  return value
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20)
    .map(content => ({ content }))
}