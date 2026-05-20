import { ragService }   from "../rag/service"
import { streamGemini } from "../../lib/gemini"
import type { SourceRef } from "../../../../shared/types"

export const chatService = {

  async streamAnswer(
    sessionId: string,
    question:  string,
    onToken:   (token: string) => void
  ): Promise<{ sources: SourceRef[]; answer: string } | { error: string }> {

    const chunks = await ragService.findRelevantChunks(sessionId, question)

    if (chunks.length === 0) {
      return { error: "No relevant information found in the uploaded file." }
    }

    const context = ragService.buildContext(chunks)
    const sources = ragService.toSourceRefs(chunks)

    const prompt = `
You are a Sales assistant. Answer only from the provided context.

Rules:
- Do not guess or add information not present in the context
- Cite [Source N] every time you use information
- If there is not enough information, respond with "No information found in the uploaded file"
- Reply in the same language as the question

Context from file:
${context}

Question: ${question}
Answer:`.trim()

    const answer = await streamGemini(prompt, onToken)
    return { sources, answer }
  },
}