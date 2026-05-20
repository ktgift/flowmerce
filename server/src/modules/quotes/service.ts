import { quotationRepository }           from "./repository"
import { Errors }                        from "../../lib/errors"
import type { CreateQuoteDto, UpdateQuoteDto, CreateQuoteItemDto, QuoteStatus } from "./model"
import { activityService }               from "../reporting/activity"

export const quoteService = {

  async findMany(tenantId: number) {
    return quotationRepository.findMany(tenantId)
  },

  async findOne(tenantId: number, id: number) {
    const quote = await quotationRepository.findOne(tenantId, id)
    if (!quote) throw Errors.QUOTE_NOT_FOUND()
    return quote
  },

  async create(tenantId: number, data: CreateQuoteDto) {
    const quoteNumber = await quotationRepository.nextQuoteNumber(tenantId)
    const quote = await quotationRepository.create(tenantId, data, quoteNumber)
    activityService.quoteCreated(tenantId, quote.id, quote.total ?? 0).catch(() => {})
    return quote
  },

  async update(tenantId: number, id: number, patch: UpdateQuoteDto) {
    const quote = await quotationRepository.findOne(tenantId, id)
    if (!quote) throw Errors.QUOTE_NOT_FOUND()
    await quotationRepository.update(tenantId, id, patch as any)
    return quotationRepository.findOne(tenantId, id)
  },

  async updateItems(tenantId: number, id: number, items: CreateQuoteItemDto[]) {
    const quote = await quotationRepository.findOne(tenantId, id)
    if (!quote) throw Errors.QUOTE_NOT_FOUND()
    await quotationRepository.replaceItems(tenantId, id, items, quote.vatRate)
    return quotationRepository.findOne(tenantId, id)
  },

  async updateStatus(tenantId: number, id: number, status: QuoteStatus) {
    const quote = await quotationRepository.findOne(tenantId, id)
    if (!quote) throw Errors.QUOTE_NOT_FOUND()
    const oldStatus = quote.status
    await quotationRepository.updateStatus(tenantId, id, status)
    activityService.quoteStatusChanged(
      tenantId, id, oldStatus, status, quote.total ?? 0,
    ).catch(() => {})
  },

  async delete(tenantId: number, id: number) {
    const quote = await quotationRepository.findOne(tenantId, id)
    if (!quote) throw Errors.QUOTE_NOT_FOUND()
    await quotationRepository.delete(tenantId, id)
  },
}
