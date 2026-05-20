export interface DraftPromptParams {
  customerName:    string
  customerCompany: string
  freeText:        string
  context:         string
}

export interface VerticalStrategy {
  buildDraftPrompt(params: DraftPromptParams): string
  defaultVatRate():  number
  defaultCurrency(): string
}
