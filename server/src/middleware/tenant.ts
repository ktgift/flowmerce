import { Elysia } from "elysia"
import { DEFAULT_TENANT_ID } from "../../../shared/types"
import type { Vertical } from "../../../shared/types"
import { tenantRepository } from "../lib/tenant"

/**
 * Inject tenantId + vertical เข้าทุก request context
 *
 * ── Single-tenant mode (ตอนนี้) ──
 * return ค่าคงที่ tenantId = 1 อ่าน vertical จาก DB
 *
 * ── Multi-tenant mode (อนาคต) ──
 * uncomment ส่วนล่าง — verify JWT, ดึง tenantId/userId จาก token
 * ที่เหลือทั้งระบบไม่ต้องแก้
 */
export const tenantMiddleware = new Elysia({ name: "tenant" })
  .derive({ as: "global" }, async () => {
    // ── Single-tenant ──
    const tenant = await tenantRepository.findOne(DEFAULT_TENANT_ID)
    const vertical: Vertical = (tenant?.vertical as Vertical) ?? "trader"
    return { tenantId: DEFAULT_TENANT_ID, vertical }

    // ── Multi-tenant (อนาคต) ──
    // const token = headers.authorization?.replace("Bearer ", "")
    // if (!token) throw Errors.NOT_LOGGED_IN("system")
    // const payload = verifyJwt(token)
    // const tenant = await tenantRepository.findOne(payload.tenantId)
    // return {
    //   tenantId: payload.tenantId,
    //   vertical: tenant.vertical as Vertical,
    //   userId:   payload.userId,
    // }
  })