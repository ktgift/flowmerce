import { ragService }   from "../rag/service"
import { streamGemini } from "../../lib/gemini"

const TONE_MAP: Record<string, string> = {
  formal:   "polite and formal",
  friendly: "friendly and warm",
  brief:    "short, concise, and to the point",
}

export const emailService = {

  async streamReply(
    sessionId:    string,
    emailContent: string,
    tone:         "formal" | "friendly" | "brief",
    language:     "th" | "en",
    onToken:      (token: string) => void
  ): Promise<void> {

    // ดึง context จากไฟล์ที่ upload (ถ้ามี)
    const chunks  = await ragService.findRelevantChunks(
      sessionId, emailContent,
      { topPerFile: 2, maxTotal: 5, minScore: 0.4 }
    )
    const context = chunks.length > 0 ? ragService.buildContext(chunks) : ""

    const prompt = `
You are a professional Sales assistant. Draft a reply to the customer's email.

${context ? `Product/pricing information from uploaded files:\n${context}\n\n` : ""}
Customer email:
${emailContent}

Draft a reply:
- Language: ${language === "th" ? "Thai" : "English"}
- Tone: ${TONE_MAP[tone] ?? TONE_MAP.formal}
- If product/pricing information is available from the files, include it in the reply
- If there is not enough information, say that you will follow up
- Do not include a subject line

Reply:`.trim()

    await streamGemini(prompt, onToken)
  },
}