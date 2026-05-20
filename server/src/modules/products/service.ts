import { productRepository }           from "./repository"
import { Errors }                     from "../../lib/errors"
import type { NewProduct, UpdateProduct } from "./model"

export const productService = {

  async findMany(tenantId: number, search?: string) {
    return productRepository.findMany(tenantId, search)
  },

  async findOne(tenantId: number, id: number) {
    const record = await productRepository.findOne(tenantId, id)
    if (!record) throw Errors.PRODUCT_NOT_FOUND()
    const price = await productRepository.getCurrentPrice(tenantId, id)
    const inv   = await productRepository.getInventory(tenantId, id)
    return {
      ...record,
      sellPrice: price?.sellPrice ?? 0,
      costPrice: price?.costPrice ?? 0,
      qtyOnHand: inv?.qtyOnHand ?? 0,
    }
  },

  async create(tenantId: number, data: Omit<NewProduct, "tenantId"> & { sellPrice?: number; costPrice?: number }) {
    const { sellPrice, costPrice, ...productData } = data
    const product = await productRepository.create({ tenantId, ...productData })
    if (sellPrice !== undefined || costPrice !== undefined) {
      await productRepository.upsertPrice(tenantId, product.id, costPrice ?? 0, sellPrice ?? 0)
    }
    return product
  },

  async update(tenantId: number, id: number, patch: UpdateProduct & { sellPrice?: number; costPrice?: number }) {
    const record = await productRepository.findOne(tenantId, id)
    if (!record) throw Errors.PRODUCT_NOT_FOUND()
    const { sellPrice, costPrice, ...productPatch } = patch
    await productRepository.update(tenantId, id, productPatch)
    if (sellPrice !== undefined || costPrice !== undefined) {
      const existing = await productRepository.getCurrentPrice(tenantId, id)
      await productRepository.upsertPrice(
        tenantId, id,
        costPrice ?? existing?.costPrice ?? 0,
        sellPrice ?? existing?.sellPrice ?? 0,
      )
    }
    return productRepository.findOne(tenantId, id)
  },

  async delete(tenantId: number, id: number) {
    const record = await productRepository.findOne(tenantId, id)
    if (!record) throw Errors.PRODUCT_NOT_FOUND()
    await productRepository.softDelete(tenantId, id)
  },

  async updateInventory(tenantId: number, id: number, qtyOnHand: number, location?: string) {
    const record = await productRepository.findOne(tenantId, id)
    if (!record) throw Errors.PRODUCT_NOT_FOUND()
    await productRepository.upsertInventory(tenantId, id, qtyOnHand, location)
  },
}
