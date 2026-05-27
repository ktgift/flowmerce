import { poService }         from "./service"
import { receivingService }  from "./receiving.service"
import { poExportService }   from "./export"
import type {
  PoFilter, CreatePoInput, UpdatePoInput, PoStatus, CreateReceiptInput,
} from "../../types/po"

export const poHandler = {
  list: (tenantId: number, filter: PoFilter) =>
    poService.list(tenantId, filter),

  get: (tenantId: number, id: number) =>
    poService.get(tenantId, id),

  create: (tenantId: number, vertical: string, body: CreatePoInput) =>
    poService.create(tenantId, vertical, body),

  createFromQuotation: (
    tenantId: number, vertical: string, quotationId: number,
    body: Omit<CreatePoInput, "items">,
  ) => poService.createFromQuotation(tenantId, vertical, quotationId, body),

  update: (tenantId: number, id: number, body: UpdatePoInput, changedBy?: string | null) =>
    poService.update(tenantId, id, body, changedBy),

  changeStatus: (
    tenantId: number, id: number, status: PoStatus,
    changedBy: string | undefined, note: string | undefined, userRole: string | undefined,
  ) => poService.changeStatus(tenantId, id, status, changedBy, note, userRole),

  receive: (tenantId: number, poId: number, body: CreateReceiptInput) =>
    receivingService.receive(tenantId, poId, body),

  getReceipt: (tenantId: number, receiptId: number) =>
    receivingService.getReceipt(tenantId, receiptId),

  getHistory: (tenantId: number, id: number) =>
    poService.getHistory(tenantId, id),

  softDelete: (tenantId: number, id: number) =>
    poService.softDelete(tenantId, id),

  summary: (tenantId: number) =>
    poService.summary(tenantId),

  exportPdf: (tenantId: number, id: number, exportedBy?: string | null) =>
    poExportService.exportPdf(tenantId, id, exportedBy),
}
