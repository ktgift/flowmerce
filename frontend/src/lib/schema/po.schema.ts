import { z } from "zod"

const supplierSnapshotSchema = z.object({
  id:            z.number().optional(),
  label:         z.string().optional(),
  code:          z.string().nullish(),
  contactPerson: z.string().nullish(),
  email:         z.string().nullish(),
  taxId:         z.string().nullish(),
  phone:         z.string().nullish(),
  address:       z.string().nullish(),
})

export const poItemSchema = z.object({
  itemType:             z.string().optional(),
  refId:                z.number().optional(),
  name:                 z.string().optional(),
  sku:                  z.string().optional(),
  unit:                 z.string().optional(),
  quantity:             z.number().min(0).optional(),
  exWorkPrice:          z.number().min(0).optional(),
  freightCost:          z.number().min(0).optional(),
  cifPrice:             z.number().min(0).optional(),
  taxRate:              z.number().min(0).optional(),
  clearingCost:         z.number().min(0).optional(),
  warehouseCostPercent: z.number().min(0).optional(),
  sortOrder:            z.number().optional(),
})

export const poCreateSchema = z.object({
  supplierId:       z.number().optional(),
  supplierSnapshot: supplierSnapshotSchema.optional(),
  currency:       z.string().optional(),
  exchangeRate:   z.number().min(0).optional(),
  paymentTerm:    z.string().optional(),
  deliveryTerm:   z.string().optional(),
  shippingMethod: z.string().optional(),
  expectedDate:   z.string().optional(),
  remark:         z.string().optional(),
  createdBy:      z.string().optional(),
  items:          z.array(poItemSchema),
})

export const poUpdateSchema = z.object({
  supplierId:       z.number().optional(),
  supplierSnapshot: supplierSnapshotSchema.optional(),
  currency:       z.string().optional(),
  exchangeRate:   z.number().min(0).optional(),
  paymentTerm:    z.string().optional(),
  deliveryTerm:   z.string().optional(),
  shippingMethod: z.string().optional(),
  expectedDate:   z.string().optional(),
  remark:         z.string().optional(),
  items:          z.array(poItemSchema).optional(),
})

export const receiptItemSchema = z.object({
  poItemId:          z.number(),
  quantityReceived:  z.number().min(0),
  lotNumber:         z.string().optional(),
  lotExpirationDate: z.string().optional(),
  location:          z.string().optional(),
  note:              z.string().optional(),
})

export const receiptCreateSchema = z.object({
  receiptNumber: z.string().min(1),
  receivedDate:  z.string().optional(),
  receivedBy:    z.string().optional(),
  note:          z.string().optional(),
  items:         z.array(receiptItemSchema),
})

export type PoItemFormValues        = z.infer<typeof poItemSchema>
export type PoCreateFormValues      = z.infer<typeof poCreateSchema>
export type PoUpdateFormValues      = z.infer<typeof poUpdateSchema>
export type ReceiptItemFormValues   = z.infer<typeof receiptItemSchema>
export type ReceiptCreateFormValues = z.infer<typeof receiptCreateSchema>
