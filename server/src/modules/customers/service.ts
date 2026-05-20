import { customerRepository }            from "./repository"
import { Errors }                        from "../../lib/errors"
import type { NewCustomer, UpdateCustomer } from "./model"

export const customerService = {

  async findMany(tenantId: number, search?: string) {
    return customerRepository.findMany(tenantId, search)
  },

  async findOne(tenantId: number, id: number) {
    const record = await customerRepository.findOne(tenantId, id)
    if (!record) throw Errors.CUSTOMER_NOT_FOUND()
    return record
  },

  async create(tenantId: number, data: Omit<NewCustomer, "tenantId">) {
    return customerRepository.create({ tenantId, ...data })
  },

  async update(tenantId: number, id: number, patch: UpdateCustomer) {
    const record = await customerRepository.findOne(tenantId, id)
    if (!record) throw Errors.CUSTOMER_NOT_FOUND()
    await customerRepository.update(tenantId, id, patch)
    return customerRepository.findOne(tenantId, id)
  },

  async delete(tenantId: number, id: number) {
    const record = await customerRepository.findOne(tenantId, id)
    if (!record) throw Errors.CUSTOMER_NOT_FOUND()
    await customerRepository.softDelete(tenantId, id)
  },
}
