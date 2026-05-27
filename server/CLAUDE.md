คุณเป็น senior TypeScript developer ที่เชี่ยวชาญ Elysia + Bun + Drizzle

ฉันมี backend project (Elysia + Bun + Drizzle + SQLite) ที่เขียน logic เสร็จแล้ว แต่จัดโครงสร้างแย่:
- หลาย module ยัด schema validation + business logic + DB query ปนกันในไฟล์เดียว
- ไม่มีการแยก type ออกมาเป็นไฟล์เฉพาะ
- บาง route เรียก DB ตรง บาง service ก็แตะ HTTP context (set, request)
- repository มี if/else ของ business rule ปนอยู่

ฉันต้องการ refactor **ทั้ง project** ให้เป็น Layered Architecture แบบนี้:
Request → Handler → Service → Repository → Database

---

## กฎที่ต้องรักษาทุก module (สำคัญที่สุด)

| Layer | หน้าที่ | ห้าม |
|---|---|---|
| **types.ts** | Zod/TypeBox schemas + TypeScript interfaces/types ของ module | มี logic, มี function |
| **Route** | รับ HTTP, validate ด้วย schema จาก types.ts, เรียก Handler | เรียก Service/Repository ตรง, มี business logic |
| **Handler** | orchestrate เรียก Service ตามลำดับ, transform input/output | มี business logic ของตัวเอง, แตะ DB ตรง |
| **Service** | business logic ล้วนๆ | รู้จัก Elysia types (Context, Set, request, response), แตะ DB ตรง |
| **Repository** | CRUD กับ DB เท่านั้น | มี if/else ของ business rule, เรียก service อื่น, มี side effect (เช่น log, call API) |
| **Model/Schema** | type definition เท่านั้น | มี method |

⚠️ **ห้าม import ข้าม layer** — Route ห้าม import Repository, Service ห้าม import Elysia
⚠️ **type ของ module ใดๆ ให้ไปสร้างไว้ใน server/src/types/xxx(ชื่อ module).ts และ type ต้องอยู่ใน server/src/types/xxx(ชื่อ module).ts ของ module นั้นเสมอ** ห้ามนิยาม type ใน route/service/repository

---

## โครงสร้างไฟล์ที่ต้องการ (ใช้กับทุก module)
modules/
└── <module-name>/           เช่น purchase-orders, suppliers, products

├── repository.ts        ← DB queries เท่านั้น
├── service.ts           ← business logic ถ้าต้องเรียก service หลายตัวพร้อมกัน (เช่น create PO แล้ว notify + log ต่อเนื่อง) ทำใน service, 
├── handler.ts           ← Elysia routes เรียก service โดยตรง
types
├── <module-name>.ts             ← Schemas (TypeBox/Zod) + interface ทั้งหมด

ถ้า module ใหญ่ มี sub-feature (เช่น PO + Receiving) แยกเป็นไฟล์ย่อย:
modules/purchase-orders/
├── repository.ts
├── service.ts
├── receiving.service.ts     ← sub-feature service
├── handler.ts
└── route.ts

---

## ตัวอย่าง pattern ที่ถูกต้อง (อ้างจาก project reference)

**types.ts** — รวม schema + types
```typescript
import { t } from "elysia"

export const poItemSchema = t.Object({
  name:     t.String({ minLength: 1 }),
  quantity: t.Number({ minimum: 0 }),
  // ...
})

export const createPoBodySchema = t.Object({
  supplierId: t.Optional(t.Number()),
  items:      t.Array(poItemSchema),
})

export const poStatusSchema = t.Union([
  t.Literal("draft"),
  t.Literal("approved"),
  // ...
])

export type PoStatus = typeof poStatusSchema.static
export interface PoFilter {
  status?:     string
  supplierId?: number
  search?:     string
}
```

**handler.ts** — เรียก service ตรงๆ ไม่มี logic
```typescript
import { poService } from "./service"
import type { PoFilter } from "./types"

export const poHandler = {
  list:         (tenantId: string, filter: PoFilter) => poService.list(tenantId, filter),
  get:          (tenantId: string, id: number)       => poService.get(tenantId, id),
  create:       (tenantId, vertical, body)           => poService.create(tenantId, vertical, body),
  changeStatus: (tenantId, id, body, userRole, userName) =>
    poService.changeStatus(tenantId, id, body.status, body.changedBy ?? userName, body.note, userRole),
  // ...
}
```

**route.ts** — บางที่สุด ไม่มี logic ใดๆ
```typescript
import { Elysia } from "elysia"
import { poHandler } from "./handler"
import { createPoBodySchema, /* ... */ } from "./types"
import { parseId } from "../../lib/utils"

export const poRoute = new Elysia({ prefix: "/purchase-orders" })
  .use(tenantMiddleware)
  .get("/", ({ tenantId, query }) => poHandler.list(tenantId, query as PoFilter), {
    query: listQuerySchema,
  })
  .post("/", async ({ tenantId, vertical, body, set }) => {
    const data = await poHandler.create(tenantId, vertical, body)
    set.status = 201
    return { success: true, data }
  }, { body: createPoBodySchema })
  // ...
```

---

## กระบวนการ refactor (ทำทีละ module)

สำหรับแต่ละ module ที่ฉันส่งให้:

1. **อ่านโค้ดเดิมทั้งหมดก่อน** เข้าใจ logic แล้วระบุว่าแต่ละบรรทัดควรไป layer ไหน
2. **แยก types.ts ออกมาก่อน** — รวม schema validation + interface + type ทั้งหมด export ให้ครบ
3. **ตรวจ repository.ts** — ลบ if/else ของ business rule ออก ถ้ามี ย้ายไป service
4. **ตรวจ service.ts** — ลบการอ้างอิง HTTP types (set, request) ออกทั้งหมด ย้ายไป handler/route
5. **สร้าง/refactor handler.ts** — แค่เรียก service ตามลำดับ ไม่มี logic
6. **ทำให้ route.ts บางที่สุด** — แค่ validate + เรียก handler
7. **ห้ามเปลี่ยน business logic** — ย้ายโค้ดเท่านั้น

---

## Output ที่ต้องการ

สำหรับแต่ละ module แสดงตามลำดับ:
1. **วิเคราะห์ก่อน** — บอกว่าโค้ดเดิมผิด layer ตรงไหนบ้าง (สั้นๆ เป็น bullet)
2. **types.ts** (เต็มไฟล์)
3. **repository.ts** (เฉพาะส่วนที่เปลี่ยน + diff สรุป)
4. **service.ts** (เฉพาะส่วนที่เปลี่ยน + diff สรุป)
5. **handler.ts** (เต็มไฟล์ — เพราะมักเป็นไฟล์ใหม่)
6. **route.ts** (เต็มไฟล์)

ถ้า module ไหนซับซ้อนเกิน 1 message ให้แบ่งทำเป็น 2-3 message ได้