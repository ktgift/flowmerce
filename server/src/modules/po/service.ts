import { poRepository, type PoFilter } from "./repository"
import { Errors }                       from "../../lib/errors"
import type { CreatePoInput, UpdatePoInput, PoStatus } from "./model"
import { activityService }              from "../reporting/activity"

const VALID_TRANSITIONS: Record<string, PoStatus[]> = {
  draft:             ["pending_approval", "cancelled"],
  pending_approval:  ["approved", "rejected", "cancelled"],
  approved:          ["sent_to_supplier", "cancelled"],
  sent_to_supplier:  ["partial_received", "received"],
  partial_received:  ["received", "closed"],
  received:          ["closed"],
  rejected:          ["draft"],
  cancelled:         [],
  closed:            [],
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
    return full
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

  async update(tenantId: number, id: number, input: UpdatePoInput) {
    const po = await poRepository.findOne(tenantId, id)
    if (!po) throw Errors.PO_NOT_FOUND()

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
        expectedDate:    input.expectedDate ?? undefined,
        remark:          input.remark ?? undefined,
        subtotal:        round2(subtotal),
        subtotalThb:     round2(subtotalThb),
        totalLandedCost: round2(totalLandedCost),
      }, itemsWithCalc)
    } else {
      await poRepository.updateHeader(tenantId, id, {
        supplierId:   input.supplierId ?? undefined,
        currency:     input.currency,
        exchangeRate: input.exchangeRate,
        paymentTerm:  input.paymentTerm ?? undefined,
        deliveryTerm: input.deliveryTerm ?? undefined,
        expectedDate: input.expectedDate ?? undefined,
        remark:       input.remark ?? undefined,
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
    if (newStatus === "approved" || newStatus === "rejected") {
      if (userRole !== "admin" && userRole !== "procurement_manager") {
        throw Errors.FORBIDDEN()
      }
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

  async softDelete(tenantId: number, id: number) {
    const po = await poRepository.findOne(tenantId, id)
    if (!po) throw Errors.PO_NOT_FOUND()
    await poRepository.softDelete(tenantId, id)
  },
}
