import { supplierRepository }            from "./repository"
import { Errors }                        from "../../lib/errors"
import type { NewSupplier, UpdateSupplier } from "./model"

export const supplierService = {

  async findMany(tenantId: number, search?: string) {
    return supplierRepository.findMany(tenantId, search)
  },

  async findOne(tenantId: number, id: number) {
    const record = await supplierRepository.findOne(tenantId, id)
    if (!record) throw Errors.SUPPLIER_NOT_FOUND()
    return record
  },

  async create(tenantId: number, data: Omit<NewSupplier, "tenantId">) {
    return supplierRepository.create({ tenantId, ...data })
  },

  async update(tenantId: number, id: number, patch: UpdateSupplier) {
    const record = await supplierRepository.findOne(tenantId, id)
    if (!record) throw Errors.SUPPLIER_NOT_FOUND()
    await supplierRepository.update(tenantId, id, patch)
    return supplierRepository.findOne(tenantId, id)
  },

  async delete(tenantId: number, id: number) {
    const record = await supplierRepository.findOne(tenantId, id)
    if (!record) throw Errors.SUPPLIER_NOT_FOUND()
    await supplierRepository.softDelete(tenantId, id)
  },

  async findOptions(tenantId: number) {
    return supplierRepository.findOptions(tenantId)
  },
}
