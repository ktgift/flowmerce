import type { VerticalStrategy, DraftPromptParams } from "./strategy"

export const traderStrategy: VerticalStrategy = {

  buildDraftPrompt({ customerName, customerCompany, freeText, context }: DraftPromptParams): string {
    return `
You are a sales assistant for a trading company. Extract quotation items from the request below.

Customer: ${customerName} (${customerCompany})
Request: ${freeText}
${context ? `\nProduct/Pricing reference:\n${context}` : ""}

Return ONLY a JSON code block containing an array of items. Each item must have:
- productName (string)
- qty (number)
- unit (string, e.g. "pcs", "box", "kg")
- unitPrice (number, 0 if unknown)
- description (string, optional)

Example:
\`\`\`json
[{"productName":"Widget A","qty":10,"unit":"pcs","unitPrice":250,"description":""}]
\`\`\`
`.trim()
  },

  defaultVatRate():  number { return 0.07 },
  defaultCurrency(): string { return "THB" },
}
