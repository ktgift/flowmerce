import { ragService }   from "../rag/service"
import { streamGemini } from "../../lib/gemini"
import type { QuoteItem } from "../../../../shared/types"

export const quoteService = {

  async streamQuotation(
    sessionId:       string,
    customerName:    string,
    customerCompany: string,
    items:           QuoteItem[],
    notes:           string | undefined,
    onToken:         (token: string) => void
  ): Promise<void> {

    // look up pricing for each item
    const priceContexts: string[] = []
    for (const item of items) {
      const chunks = await ragService.findRelevantChunks(
        sessionId, item.productName,
        { topPerFile: 1, maxTotal: 2, minScore: 0.4 }
      )
      if (chunks.length > 0) {
        priceContexts.push(
          `Product "${item.productName}":\n` +
          chunks.map(c => c.content).join("\n")
        )
      }
    }

    const itemList = items
      .map(i => `- ${i.productName} qty ${i.quantity} ${i.unit}`)
      .join("\n")

    const prompt = `
You are a professional Sales assistant. Generate a quotation in Markdown format.

Customer: ${customerName} (${customerCompany})
Items:
${itemList}
${priceContexts.length > 0
  ? `\nPricing information from Price List:\n${priceContexts.join("\n\n")}`
  : "\nNo pricing data found in files. Use [Please specify price] as a placeholder."}
${notes ? `\nNotes: ${notes}` : ""}

Generate a Markdown quotation containing:
Title, Date, Customer info, Item table (Name | Qty | Unit | Unit Price | Total), Subtotal, VAT 7%, Grand Total, Payment terms 30 days, Signature

Reply:`.trim()

    await streamGemini(prompt, onToken)
  },
}