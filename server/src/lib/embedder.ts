import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
const cache = new Map<string, number[]>()

export async function embedText(text: string): Promise<number[]> {
  if (cache.has(text)) return cache.get(text)!
  const result = await model.embedContent(text)
  const vector = result.embedding.values
  cache.set(text, vector)
  return vector
}

export async function embedBatch(
  texts: string[],
  onProgress?: (done: number, total: number) => void
): Promise<number[][]> {
  const results: number[][] = []
  const BATCH = 5  // Gemini free tier rate limit

  //TODO: ถ้าเจอ error 429 บ่อย แก้แค่ 2 จุด:
  // const BATCH = 3          // ลด concurrent จาก 5 → 3
  // // ...
  // await Bun.sleep(400)     // เพิ่ม delay จาก 200 → 400ms
  
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH)
    const vecs = await Promise.all(batch.map(embedText))
    results.push(...vecs)
    onProgress?.(Math.min(i + BATCH, texts.length), texts.length)
    if (i + BATCH < texts.length) await Bun.sleep(200)
  }
  return results
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return magA && magB ? dot / (magA * magB) : 0
}