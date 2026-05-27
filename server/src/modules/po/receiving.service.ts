import { poRepository }            from "./repository"
import { Errors }                  from "../../lib/errors"
import type { CreateReceiptInput } from "../../types/po"

export const receivingService = {

  async receive(
    tenantId: number,
    poId: number,
    input: CreateReceiptInput,
  ) {
    const po = await poRepository.findFull(tenantId, poId)
    if (!po) throw Errors.PO_NOT_FOUND()

    const receipt = await poRepository.createReceipt(
      tenantId,
      {
        purchaseOrderId: poId,
        receiptNumber:   input.receiptNumber,
        receivedDate:    input.receivedDate ?? null,
        receivedBy:      input.receivedBy ?? null,
        note:            input.note ?? null,
      },
      input.items.map(it => ({
        poItemId:         it.poItemId,
        quantityReceived: it.quantityReceived,
        lotNumber:        it.lotNumber ?? null,
        lotExpirationDate: it.lotExpirationDate ?? null,
        location:         it.location ?? null,
        note:             it.note ?? null,
      })),
    )

    // update quantity_received on each PO item
    for (const ri of input.items) {
      const poItem = po.items.find(i => i.id === ri.poItemId)
      if (!poItem) continue
      const newQty = (poItem.quantityReceived ?? 0) + ri.quantityReceived
      await poRepository.updateItemReceivedQty(tenantId, ri.poItemId, newQty)
    }

    // re-fetch items to check fulfillment
    const updatedItems = await poRepository.findItems(tenantId, poId)
    const allReceived  = updatedItems.every(
      it => (it.quantityReceived ?? 0) >= (it.quantity ?? 0),
    )
    const anyReceived  = updatedItems.some(it => (it.quantityReceived ?? 0) > 0)

    const newStatus = allReceived
      ? "received"
      : anyReceived
        ? "partial_received"
        : po.status

    await poRepository.addHistory(tenantId, {
      purchaseOrderId: poId,
      action:          "receipt_added",
      oldStatus:       null,
      newStatus:       null,
      changedBy:       input.receivedBy ?? null,
      note:            input.receiptNumber,
    })

    if (newStatus !== po.status) {
      await poRepository.updateStatus(
        tenantId,
        poId,
        newStatus,
        input.receivedBy ?? null,
        null,
      )
    }

    return receipt
  },

  async getReceipt(tenantId: number, receiptId: number) {
    const items = await poRepository.findReceiptItems(tenantId, receiptId)
    if (items === null) throw Errors.RECEIPT_NOT_FOUND()
    return items
  },
}
