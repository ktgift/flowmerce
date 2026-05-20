import { callGemini }              from "../../lib/gemini"
import { ragService }             from "../rag/service"
import { getVerticalStrategy }    from "../../lib/verticals"
import type { CreateQuoteDto }    from "./model"
import type { Vertical }          from "shared"

export const quoteDraftService = {

  async generateDraft(params: {
    sessionId:       string
    vertical:        Vertical
    customerName:    string
    customerCompany: string
    freeText:        string
  }): Promise<CreateQuoteDto> {
    const { sessionId, vertical, customerName, customerCompany, freeText } = params
    const strategy = getVerticalStrategy(vertical)

    const chunks  = await ragService.findRelevantChunks(sessionId, freeText, { topPerFile: 2, maxTotal: 6, minScore: 0.35 })
    const context = chunks.length > 0 ? ragService.buildContext(chunks) : ""

    const prompt = strategy.buildDraftPrompt({ customerName, customerCompany, freeText, context })
    const raw    = await callGemini(prompt)

    const items = parseItemsFromAI(raw)

    return { sessionId, customerName, customerCompany, items }
  },
}

function parseItemsFromAI(raw: string): CreateQuoteDto["items"] {
  try {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) ?? raw.match(/(\[[\s\S]*?\])/)
    if (!jsonMatch) return []
    const parsed = JSON.parse(jsonMatch[1]) as any[]
    return parsed.map(i => ({
      productName: String(i.productName ?? i.name ?? "สินค้า"),
      description: i.description ? String(i.description) : undefined,
      qty:         Number(i.qty ?? i.quantity ?? 1),
      unit:        String(i.unit ?? "pcs"),
      unitPrice:   Number(i.unitPrice ?? i.price ?? 0),
      discountPct: Number(i.discountPct ?? 0),
    }))
  } catch {
    return []
  }
}
