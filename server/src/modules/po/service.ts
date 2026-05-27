import { poRepository }        from "./repository"
import { supplierRepository }  from "../suppliers/repository"
import { Errors }              from "../../lib/errors"
import type { PoFilter, CreatePoInput, UpdatePoInput, PoStatus, PoSummary } from "../../types/po"
import { activityService }     from "../reporting/activity"

const VALID_TRANSITIONS: Record<string, PoStatus[]> = {
  draft:            ["issued", "cancelled"],
  issued:           ["acknowledged", "cancelled"],
  acknowledged:     ["partial_received", "received", "cancelled"],
  partial_received: ["received", "closed", "cancelled"],
  received:         ["closed"],
  closed:           [],
  cancelled:        [],
  // Legacy statuses for backward compatibility
  pending_approval: ["issued", "cancelled"],
  approved:         ["issued", "cancelled"],
  sent_to_supplier: ["acknowledged", "partial_received", "received", "cancelled"],
  rejected:         ["draft"],
}

const round2 = (n: number) => Math.round(n * 100) / 100

function calcLandedCostPerUnit(
  exWorkPrice: number,
  freightCost: number,
  cifPrice: number,
  taxRate: number,
  clearingCost: number,
  warehouseCostPercent: number,
  exchangeRate: number,
  quantity: number,
): number {
  if (quantity <= 0) return 0
  const cif       = cifPrice > 0 ? cifPrice : exWorkPrice + freightCost
  const cifThb    = cif * exchangeRate
  const dutyThb   = cifThb * (taxRate / 100)
  const totalLanded = cifThb + dutyThb + clearingCost
  const warehouseThb = totalLanded * (warehouseCostPercent / 100)
  return round2((totalLanded + warehouseThb) / quantity)
}

async function generatePoNumber(tenantId: number): Promise<string> {
  const year  = new Date().getFullYear()
  const count = await poRepository.countByYear(tenantId, year)
  return `PO-${year}-${String(count + 1).padStart(4, "0")}`
}

export const poService = {

  async list(tenantId: number, filter: PoFilter = {}) {
    return poRepository.findAll(tenantId, filter)
  },

  async get(tenantId: number, id: number) {
    const full = await poRepository.findFull(tenantId, id)
    if (!full) throw Errors.PO_NOT_FOUND()

    let supplierName: string | null = null
    if (full.supplierId) {
      const supplier = await supplierRepository.findOne(tenantId, full.supplierId)
      supplierName = supplier?.name ?? null
    }

    return { ...full, totalAmount: full.subtotal, supplierName }
  },

  async create(tenantId: number, vertical: string, input: CreatePoInput) {
    const exchangeRate = input.exchangeRate ?? 1
    const poNumber     = await generatePoNumber(tenantId)

    let subtotal        = 0
    let subtotalThb     = 0
    let totalLandedCost = 0

    const itemsWithCalc = input.items.map((it, i) => {
      const qty                = it.quantity
      const exWork             = it.exWorkPrice
      const freight            = it.freightCost ?? 0
      const cif                = it.cifPrice ?? 0
      const taxRate            = it.taxRate ?? 0
      const clearing           = it.clearingCost ?? 0
      const warehousePct       = it.warehouseCostPercent ?? 0
      const lineTotal          = round2(exWork * qty)
      const lineTotalThb       = round2(lineTotal * exchangeRate)
      const landedCostPerUnit  = calcLandedCostPerUnit(
        exWork, freight, cif, taxRate, clearing, warehousePct, exchangeRate, qty,
      )

      subtotal        += lineTotal
      subtotalThb     += lineTotalThb
      totalLandedCost += round2(landedCostPerUnit * qty)

      return {
        itemType:             it.itemType ?? "trader_product",
        refId:                it.refId ?? null,
        name:                 it.name,
        sku:                  it.sku ?? null,
        unit:                 it.unit ?? null,
        quantity:             qty,
        exWorkPrice:          exWork,
        freightCost:          freight,
        cifPrice:             cif,
        taxRate,
        clearingCost:         clearing,
        warehouseCostPercent: warehousePct,
        landedCostPerUnit,
        lineTotal,
        lineTotalThb,
        sortOrder:            it.sortOrder ?? i,
      }
    })

    const po = await poRepository.createWithItems(tenantId, {
      vertical,
      poNumber,
      supplierId:      input.supplierId ?? null,
      status:          "draft",
      currency:        input.currency ?? "USD",
      exchangeRate,
      paymentTerm:     input.paymentTerm ?? null,
      deliveryTerm:    input.deliveryTerm ?? null,
      shippingMethod:  input.shippingMethod ?? null,
      expectedDate:    input.expectedDate ?? null,
      remark:          input.remark ?? null,
      createdBy:       input.createdBy ?? null,
      subtotal:        round2(subtotal),
      subtotalThb:     round2(subtotalThb),
      totalLandedCost: round2(totalLandedCost),
    }, itemsWithCalc)

    activityService.poCreated(tenantId, po.id, round2(subtotalThb)).catch(() => {})
    return this.get(tenantId, po.id)
  },

  async createFromQuotation(
    tenantId: number,
    vertical: string,
    quotationId: number,
    input: Omit<CreatePoInput, "items">,
  ) {
    const po = await this.create(tenantId, vertical, { ...input, items: [] })

    // patch link only — do NOT use updateWithItems (would wipe items)
    await poRepository.updateHeader(tenantId, po.id, {
      sourceQuotationId: quotationId,
    })

    return this.get(tenantId, po.id)
  },

  async update(tenantId: number, id: number, input: UpdatePoInput, changedBy?: string | null) {
    const po = await poRepository.findOne(tenantId, id)
    if (!po) throw Errors.PO_NOT_FOUND()

    if (po.status !== "draft" && po.status !== "pending_approval") {
      throw Errors.PO_CANNOT_EDIT(po.status)
    }

    const resetStatus = po.status === "pending_approval" ? ("draft" as const) : undefined

    if (input.items !== undefined) {
      const exchangeRate = input.exchangeRate ?? po.exchangeRate ?? 1

      let subtotal        = 0
      let subtotalThb     = 0
      let totalLandedCost = 0

      const itemsWithCalc = input.items.map((it, i) => {
        const qty               = it.quantity
        const exWork            = it.exWorkPrice
        const freight           = it.freightCost ?? 0
        const cif               = it.cifPrice ?? 0
        const taxRate           = it.taxRate ?? 0
        const clearing          = it.clearingCost ?? 0
        const warehousePct      = it.warehouseCostPercent ?? 0
        const lineTotal         = round2(exWork * qty)
        const lineTotalThb      = round2(lineTotal * exchangeRate)
        const landedCostPerUnit = calcLandedCostPerUnit(
          exWork, freight, cif, taxRate, clearing, warehousePct, exchangeRate, qty,
        )

        subtotal        += lineTotal
        subtotalThb     += lineTotalThb
        totalLandedCost += round2(landedCostPerUnit * qty)

        return {
          itemType:             it.itemType ?? "trader_product",
          refId:                it.refId ?? null,
          name:                 it.name,
          sku:                  it.sku ?? null,
          unit:                 it.unit ?? null,
          quantity:             qty,
          exWorkPrice:          exWork,
          freightCost:          freight,
          cifPrice:             cif,
          taxRate,
          clearingCost:         clearing,
          warehouseCostPercent: warehousePct,
          landedCostPerUnit,
          lineTotal,
          lineTotalThb,
          sortOrder:            it.sortOrder ?? i,
        }
      })

      await poRepository.updateWithItems(tenantId, id, {
        supplierId:      input.supplierId ?? undefined,
        currency:        input.currency,
        exchangeRate,
        paymentTerm:     input.paymentTerm ?? undefined,
        deliveryTerm:    input.deliveryTerm ?? undefined,
        shippingMethod:  input.shippingMethod ?? undefined,
        expectedDate:    input.expectedDate ?? undefined,
        remark:          input.remark ?? undefined,
        subtotal:        round2(subtotal),
        subtotalThb:     round2(subtotalThb),
        totalLandedCost: round2(totalLandedCost),
        ...(resetStatus ? { status: resetStatus } : {}),
      }, itemsWithCalc, changedBy)
    } else {
      await poRepository.updateHeader(tenantId, id, {
        supplierId:     input.supplierId ?? undefined,
        currency:       input.currency,
        exchangeRate:   input.exchangeRate,
        paymentTerm:    input.paymentTerm ?? undefined,
        deliveryTerm:   input.deliveryTerm ?? undefined,
        shippingMethod: input.shippingMethod ?? undefined,
        expectedDate:   input.expectedDate ?? undefined,
        remark:         input.remark ?? undefined,
        ...(resetStatus ? { status: resetStatus } : {}),
      })
      await poRepository.addHistory(tenantId, {
        purchaseOrderId: id,
        action:          "edited",
        oldStatus:       null,
        newStatus:       null,
        changedBy:       changedBy ?? null,
      })
    }

    return this.get(tenantId, id)
  },

  async changeStatus(
    tenantId:  number,
    id:        number,
    newStatus: PoStatus,
    changedBy?: string,
    note?:      string,
    userRole?:  string,
  ) {
    const po = await poRepository.findOne(tenantId, id)
    if (!po) throw Errors.PO_NOT_FOUND()

    if (!VALID_TRANSITIONS[po.status]?.includes(newStatus)) {
      throw Errors.PO_INVALID_STATUS(po.status, newStatus)
    }

    // Approval transitions require procurement_manager or admin
    if ((newStatus === "approved" || newStatus === "rejected") &&
        userRole !== "admin" && userRole !== "procurement_manager") {
      throw Errors.FORBIDDEN()
    }

    // repo logs history inside the same transaction
    await poRepository.updateStatus(tenantId, id, newStatus, changedBy, note)

    // Record approval decision when approved or rejected
    if (newStatus === "approved" || newStatus === "rejected") {
      const full = await poRepository.findFull(tenantId, id)
      await poRepository.addApproval(tenantId, {
        purchaseOrderId: id,
        approverName:    changedBy ?? "unknown",
        decision:        newStatus,
        amountThb:       full?.totalLandedCost ?? null,
        note:            note ?? null,
      })
    }

    activityService.poStatusChanged(tenantId, id, po.status, newStatus).catch(() => {})

    return this.get(tenantId, id)
  },

  async summary(tenantId: number): Promise<PoSummary> {
    const OPEN_STATUSES = ["draft", "issued", "acknowledged", "partial_received", "received",
      "pending_approval", "approved", "sent_to_supplier"]
    const byStatus = await poRepository.summaryByStatus(tenantId)
    const openItems = byStatus.filter(s => OPEN_STATUSES.includes(s.status))
    return {
      byStatus,
      openCount:    openItems.reduce((acc, s) => acc + s.count, 0),
      openTotalThb: openItems.reduce((acc, s) => acc + s.totalThb, 0),
    }
  },

  async softDelete(tenantId: number, id: number) {
    const po = await poRepository.findOne(tenantId, id)
    if (!po) throw Errors.PO_NOT_FOUND()
    await poRepository.softDelete(tenantId, id)
  },

  async getHistory(tenantId: number, id: number) {
    return poRepository.findHistory(tenantId, id)
  },
}
