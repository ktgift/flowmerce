import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
  model:            "gemini-2.5-flash",
  generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
})

export async function streamGemini(
  prompt: string,
  onToken: (token: string) => void
): Promise<string> {
  const result   = await model.generateContentStream(prompt)
  let fullText = ""
  for await (const chunk of result.stream) {
    const token = chunk.text()
    fullText   += token
    onToken(token)
  }
  return fullText
}

export async function callGemini(prompt: string): Promise<string> {
  let result = ""
  await streamGemini(prompt, token => { result += token })
  return result.trim()
}