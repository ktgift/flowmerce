# Flowmerce Monorepo

This repo uses mixed package managers by design:

- `pnpm` for `frontend` and `shared`
- `bun` for `server`

## What Should Exist in Root

- `node_modules/` at root: expected when using pnpm workspace
- `pnpm-workspace.yaml`: required for pnpm workspace resolution
- `pnpm-lock.yaml`: expected for frontend/shared dependency lock
- `bun.lockb` at root: optional; can exist if Bun was run at root previously

## What Should Not Be Committed

- Runtime DB files: `server/rag.db`, `server/rag.db-shm`, `server/rag.db-wal`
- Any `node_modules/` directory
- Any `.env*` file with secrets

## Local Development

From repo root:

```bash
pnpm run dev:web
pnpm run dev:server
```

Scripts:

- `dev:web` -> runs Vite in `frontend` using pnpm
- `dev:server` -> runs Elysia server in `server` using bun
- `start:server` -> starts server in non-watch mode
- `install:web` -> installs only `shared/frontend` via pnpm
- `build:web` -> builds frontend via pnpm

## Deploy on Oracle Cloud Always Free

Recommended production flow:

1. Build frontend with pnpm
2. Serve API and static assets from Bun server behind Nginx/Caddy
3. Keep persistent SQLite outside repo path

Minimal command flow on VM:

```bash
# 1) frontend/shared deps + build
pnpm run install:web
pnpm run build:web

# 2) server deps
bun --cwd server install --production

# 3) run server (with systemd in production)
DB_PATH=/var/lib/flowmerce/rag.db NODE_ENV=production bun --cwd server run start
```

Notes:

- `DB_PATH` is supported by server config and should point to persistent storage.
- Keep reverse proxy (Nginx/Caddy) on port 80/443 and forward to server port 1422.




ขออภัยด้วยครับที่เมื่อกี้ส่งไปเป็นกล่องโค้ดครอบทับอีกที คราวนี้เป็น **Markdown แท้ ๆ (Raw Markdown)** ที่ไม่ได้ครอบกล่องรหัสใด ๆ เลยครับ คุณสามารถลากคลุมดำไฮไลท์ตั้งแต่บรรทัดแรกสุดด้านล่างนี้ ยาวไปจนจบข้อความเพื่อ Copy ไปวางในไฟล์ `README.md` ได้ทันทีครับ!

---

# 📋 Purchase Order (PO) System Design Document

ระบบบริหารจัดการใบสั่งซื้อ (Purchase Order) ออกแบบสถาปัตยกรรมสำหรับธุรกิจประเภท **Trader (นำเข้า-ส่งออก)** โดยเฉพาะ ควบคุมคุณภาพของข้อมูลด้วยเทคโนโลยี Type-Safe ตั้งแต่ระดับฐานข้อมูลจนถึงหน้าบ้าน (End-to-End Type Safety)

---

## 🛠️ Technology Stack & Architecture

### System Technology Choices

* **Backend:** `Bun` + `Elysia` + `Drizzle ORM` + `SQLite` (เน้นประสิทธิภาพ ความเร็ว และ Type-Safe สูงสุด)
* **Frontend:** `React 18` + `Vite` + `TypeScript` + `MUI v5` (Component สวยงาม เป็นระบบ มี Responsive ในตัว)
* **State Management:** `React Query` (Server Cache) + `Zustand` (UI Global State)
* **Form & Validation:** `react-hook-form` + `Zod` (Type-Safe Form & Client-Side Validation)
* **PDF Engine:** `Puppeteer` (Headless Chrome บน Server รองรับ Font ภาษาไทย และ Layout ซับซ้อน)
* **Structure:** `Monorepo (Bun Workspace)` เพื่อทำ Shared Types ระหว่าง Frontend และ Backend

### 🏗️ 4-Layer Architecture (Data Flow Decision)

เพื่อป้องกันไม่ให้ Logic ปนกัน และง่ายต่อการปรับเปลี่ยนในอนาคต (เช่น การเปลี่ยนฐานข้อมูลจาก SQLite เป็น PostgreSQL) ระบบจะแบ่ง Layer ออกเป็น 4 ชั้นอย่างเด็ดขาด:

```
[ HTTP Request ]
       │
       ▼
 1. route.ts       ──► รับ Request, Validate Schema ผ่าน TypeBox/Elysia (ไม่มี Business Logic)
       │
       ▼
 2. handler.ts     ──► จัดการ Workflows, แปลง Input/Output, ประสานงานระหว่างหลาย Services
       │
       ▼
 3. service.ts     ──► ศูนย์รวม Business Logic ล้วนๆ (กฎเกณฑ์, การคำนวณราคา Landed Cost)
       │
       ▼
 4. repository.ts  ──► DB Query เท่านั้น (ไม่รับรู้กฎทางธุรกิจใดๆ ทำหน้าที่อ่าน/เขียนข้อมูลอย่างเดียว)
       │
       ▼
[ SQLite Database ]

```

---

## 🗄️ 2. Database Schema Design

ฐานข้อมูลประกอบด้วย 6 ตารางหลักที่สัมพันธ์กัน โดยเน้นสถาปัตยกรรมแบบ **Multi-Tenant (แยกข้อมูลตามบริษัท)** และระบบ **Audit Log**

```
purchase_orders (Header หลัก)
   ├──► purchase_order_items (รายการสินค้าประจำ PO) ──► po_receipt_items (รายการรับของแต่ละชิ้น)
   ├──► po_receipts (บันทึกใบรับของ / Goods Receipt)
   ├──► po_history (Audit Log บันทึกทุกความเคลื่อนไหว)
   └──► po_approvals (บันทึกการอนุมัติ / ปฏิเสธ)

```

### ฟิลด์สำคัญในตาราง `purchase_orders`

| ฟิลด์ข้อมูล | ประเภทข้อมูล | ความหมาย / หน้าที่ | เหตุผลในการออกแบบ |
| --- | --- | --- | --- |
| `poNumber` | `VARCHAR` | เลขที่เอกสารอ้างอิง (เช่น PO-2026-0001) | Auto-generated อิงตามปีและยอดนับรวม |
| `status` | `VARCHAR` | สถานะของ PO | ควบคุมด้วย State Machine เข้มงวด |
| `currency` | `VARCHAR` | สกุลเงินที่สั่งซื้อ (Default: USD) | รองรับการเป็นธุรกิจ Trader นำเข้าสินค้า |
| `exchangeRate` | `DECIMAL` | อัตราแลกเปลี่ยน ณ วันสั่งซื้อ | ใช้แปลงราคาจากสกุลเงินต่างประเทศเป็น THB |
| `subtotal` | `DECIMAL` | ยอดรวมของ Foreign Currency | ราคาสินค้าดิบก่อนรวมค่าใช้จ่ายนำเข้า |
| `subtotalThb` | `DECIMAL` | ยอดรวมแปลงเป็นเงินบาท (THB) | คำนวณจาก `subtotal × exchangeRate` |
| `totalLandedCost` | `DECIMAL` | ต้นทุนรวมการนำเข้าจริงทั้งหมด (THB) | **ตัวเลขที่สำคัญที่สุด** ใช้คิดกำไรขาดทุนจริง |
| `deletedAt` | `TIMESTAMP` | วันเวลาที่ถูกลบข้อมูล | **Soft Delete** เพื่อไม่ให้ข้อมูลทางบัญชีสูญหาย |

> ⚠️ **Delete Strategy:**
> * `purchase_orders` จะใช้ระบบ **Soft Delete** เท่านั้น เนื่องจากมีตารางอื่นอ้างอิงเชิงบัญชี
> * `purchase_order_items`, `po_history`, และ `po_approvals` จะใช้ **Hard Delete + CASCADE** เคลียร์ข้อมูลตามใบ PO หลักทันทีที่ปลดล็อกข้อมูลสำเร็จ
> 
> 

---

## 🔄 3. PO Lifecycle (State Machine)

วงจรสถานะของเอกสาร (Lifecycle) จะถูกควบคุมผ่าน State Machine บน `service.ts` เพื่อป้องกันสถานะที่ผิดพลาดในระบบบัญชี

```
[draft] ──► [issued] ──► [acknowledged] ──► [partial_received] ──► [received] ──► [closed]
   │            │               │                    │                  │
   └────────────┴───────────────┴────────────────────┴──────────────────┴───────► [cancelled]

```

### ตารางสิทธิ์และการเปลี่ยนสถานะ

| สถานะ (Status) | ความหมาย | ผู้มีสิทธิ์เปลี่ยน | วิธีการเปลี่ยน (Trigger) |
| --- | --- | --- | --- |
| **draft** | สร้างเสร็จสิ้น ยังไม่ส่งมอบ | ระบบ / User | สร้างอัตโนมัติเมื่อเริ่มเปิดใบสั่งซื้อ |
| **issued** | ส่งออก PDF ให้ Supplier แล้ว | ระบบ | **อัตโนมัติ** หลังกดปุ่ม Export PDF สำเร็จ |
| **acknowledged** | Supplier ยืนยันราคาและวันส่ง | User | **Manual** กดบันทึกการรับทราบจากคู่ค้า |
| **partial_received** | ได้รับสินค้าบางส่วนแล้ว | ระบบ | **อัตโนมัติ** เมื่อมีการบันทึกใบรับสินค้า (GR) บางชิ้น |
| **received** | ได้รับสินค้าครบถ้วนทุกรายการ | ระบบ | **อัตโนมัติ** เมื่อยอดรับสะสมครบตามจำนวนสั่งซื้อ |
| **closed** | ปิดเคส เอกสารทางบัญชีครบถ้วน | User | **Manual** กดปิดใบงานเมื่อตรวจสอบเสร็จสิ้น |
| **cancelled** | ยกเลิกเอกสาร | User | **Manual** ยกเลิกเอกสาร (ทำได้จากหลายสถานะก่อนปิดงาน) |

### กฎการเปลี่ยนสถานะ (Strict Transitions)

```typescript
const VALID_TRANSITIONS = {
  draft:            ["issued", "cancelled"],
  issued:           ["acknowledged", "cancelled"],
  acknowledged:     ["partial_received", "received", "cancelled"],
  partial_received: ["received", "closed", "cancelled"],
  received:         ["closed"],
  closed:           [], // สถานะสิ้นสุด ไม่สามารถเปลี่ยนต่อได้
  cancelled:        [], // สถานะสิ้นสุด ไม่สามารถเปลี่ยนต่อได้
}

```

*หากเกิดการพยายามลัดขั้นตอนสถานะ (Jump Status) ระบบจะทำการโยน Error Code `PO_INVALID_STATUS` กลับไปทันที*

---

## 🧮 4. Business Logic: Landed Cost Calculation

ระบบนี้ถูกออกแบบมาเพื่อคำนวณ **ต้นทุนแฝงในการนำเข้า (Landed Cost)** ทำให้ทราบราคาสินค้าจริงต่อหน่วยหลังจากรวมค่าภาษีและค่าขนส่งแล้ว โดยระบบจะคำนวณและบันทึกผลลัพธ์ลง Database ทันที (ไม่คำนวณแบบ On-the-fly ตอน Query เพื่อคงมูลค่า Snapshot ประวัติศาสตร์ไว้)

### สูตรการคำนวณ (6 ขั้นตอน)

1. $\text{CIF (USD)} = \text{exWorkPrice} + \text{freightCost}$ *(กรณีไม่ได้ระบุราคา CIF โดยตรง)*
2. $\text{CIF (THB)} = \text{CIF (USD)} \times \text{exchangeRate}$
3. $\text{Duty (THB)} = \text{CIF (THB)} \times \text{taxRate}\%$
4. $\text{Sub-Landed} = \text{CIF (THB)} + \text{Duty} + \text{clearingCost}$
5. $\text{Warehouse (THB)} = \text{Sub-Landed} \times \text{warehouseCostPercent}\%$
6. $\text{Landed per Unit} = (\text{Sub-Landed} + \text{Warehouse}) \div \text{quantity}$

### ตัวอย่างการคำนวณจริง

* สั่งซื้อสินค้า 100 ชิ้น, ราคาสินค้าหน้าโรงงาน (EXW) $10/ชิ้น, ค่าขนส่ง (Freight) $50, อัตราแลกเปลี่ยน 36.6, ภาษีนำเข้า (Tax) 15%, ค่าพิธีการศุลกากร (Clearing) ฿500, ค่าเข้าคลังสินค้า (WH) 2%
* **ผลลัพธ์:**
* $\text{CIF}$ = $(\$10 \times 100) + \$50 = \$1,050$
* $\text{CIF (THB)}$ = $\$1,050 \times 36.6 = \text{฿}38,430$
* $\text{Duty}$ = $\text{฿}38,430 \times 15\% = \text{฿}5,764.50$
* $\text{Sub-Landed}$ = $\text{฿}38,430 + \text{฿}5,764.50 + \text{฿}500 = \text{฿}44,694.50$
* $\text{Warehouse}$ = $\text{฿}44,694.50 \times 2\% = \text{฿}893.89$
* $\text{Landed per Unit}$ = $(\text{฿}44,694.50 + \text{฿}893.89) \div 100 = \mathbf{\text{฿}455.88\text{ / ชิ้น}}$



---

## 🌐 5. API Endpoints

โครงสร้าง API คืนค่าในรูปแบบสม่ำเสมอ (Standardized Response Format) ทุกเส้นทางจำเป็นต้องผ่านการยืนยันตัวตน (`Auth`)

| Method | Path | คำอธิบายหน้าที่ | Auth |
| --- | --- | --- | --- |
| `GET` | `/purchase-orders` | ดึงรายการ PO ทั้งหมดพร้อม Filter | ✅ |
| `GET` | `/purchase-orders/summary` | ดึงข้อมูลสถิติยอดรวมและมูลค่าแยกตาม Status | ✅ |
| `GET` | `/purchase-orders/:id` | ดึงรายละเอียด PO เชิงลึก (Items, Receipts, History) | ✅ |
| `POST` | `/purchase-orders` | สร้างใบสั่งซื้อ (PO) ใหม่ | ✅ |
| `POST` | `/purchase-orders/from-quotation/:id` | แปลงจากใบเสนอราคา (Quotation) มาเป็น PO | ✅ |
| `PATCH` | `/purchase-orders/:id` | แก้ไขข้อมูล PO (ทำได้เฉพาะตอนสถานะ `draft` เท่านั้น) | ✅ |
| `PATCH` | `/purchase-orders/:id/status` | ปรับเปลี่ยนสถานะตาม Transition Rules | ✅ |
| `POST` | `/purchase-orders/:id/receipts` | บันทึกใบรับสินค้า (Goods Receipt) | ✅ |
| `GET` | `/purchase-orders/:id/receipts/:receiptId` | ดูรายละเอียดประวัติการรับของแต่ละครั้ง | ✅ |
| `GET` | `/purchase-orders/:id/history` | เรียกดู Audit Log เหตุการณ์ทั้งหมดของ PO ใบนี้ | ✅ |
| `GET` | `/purchase-orders/:id/export/pdf` | ดาวน์โหลดเอกสารรูปแบบ PDF (Binary Stream) | ✅ |
| `DELETE` | `/purchase-orders/:id` | ลบข้อมูลสั่งซื้อแบบ Soft Delete | ✅ |

### รูปแบบ Response มาตรฐาน

* **กรณีสำเร็จ (Success):**
```json
{ "success": true, "data": { "id": 1, "poNumber": "PO-2026-0001" } }

```



```
* **กรณีผิดพลาด (Failure):**
  ```json
  { "success": false, "error": { "code": "PO_NOT_FOUND", "message": "ไม่พบเอกสารใบสั่งซื้อที่ระบุ" } }

```

---

## 📁 6. Frontend Directory Structure

โครงสร้างโฟลเดอร์ฝั่ง Client ได้รับการออกแบบตาม Feature-Driven Approach ในส่วนของระบบ Purchase Order:

```markdown
frontend/src/components/container/purchaseOrder/
├── 📂 POList/                      # หน้าหลักแสดงรายการ PO
│   ├── index.tsx                  - หน้าหลักรวบรวม Data Table และ Filter
│   ├── Column.tsx                 - ตั้งค่า Column Config ของ Data Table
│   ├── PoSearchSection.tsx        - ส่วนแถบค้นหาและตัวกรองข้อมูล
│   ├── PoStatusBar.tsx            - แถบ Tab จำแนกหมวดหมู่สถานะ PO
│   ├── PoStatusCards.tsx          - การ์ดแสดงผลสรุปตัวเลข (เช่น Draft: 5, Issued: 3)
│   └── PoSummaryBanner.tsx        - แบนเนอร์สรุปยอดเงินรวมของ Open PO ทั้งหมด
│
├── 📂 detail/                      # ส่วนแสดงรายละเอียดของ PO (Detail Page)
│   ├── index.tsx                  - Controller หลักคุม Tab และจัดระเบียบหน้าจอ
│   ├── PoOverviewTab.tsx          - แสดงข้อมูลทั่วไป คูค้า, เงื่อนไขชำระเงิน, วันส่งมอบ
│   ├── PoItemsTab.tsx             - ตารางรายการสินค้าพร้อมช่องคำนวณ Landed Cost
│   ├── PoReceiptsTab.tsx          - รายละเอียดและประวัติของการรับของแต่ละรอบ (Goods Receipt)
│   ├── PoHistoryTab.tsx           - แถบแสดง Timeline หรือ Audit Log ของใบ PO นั้นๆ
│   ├── PoActionMenu.tsx           - เมนูจัดการเอกสาร เช่น ปุ่มแก้ไขหรือปุ่มลบ
│   ├── PoStatusTimeline.tsx       - แถบความคืบหน้า (Progress Bar) แสดงขั้นตอน 6 ระดับ
│   ├── PoStatusAutoSection.tsx    - ส่วนแจ้งเตือนสถานะที่ระบุกำลังประมวลผลอัตโนมัติ
│   ├── PoStatusManualSection.tsx  - กลุ่มปุ่มคำสั่งควบคุมสถานะด้วยมือโดย User
│   └── PoStatusModalBody.tsx      - หน้าต่าง Modal ยืนยันก่อนทำคำสั่งเปลี่ยนสถานะ
│
├── 📂 form/                        # ส่วนบันทึกและแก้ไขเอกสาร (Create / Edit Form)
│   ├── index.tsx                  - หน้าเพจหลักของ Form (Manage State)
│   ├── PoFormContent.tsx          - ส่วนจัดวาง Layout หลักภายในฟอร์ม
│   ├── PoSupplierSection.tsx      - ช่องค้นหาและเลือกผู้ให้บริการ/คู่ค้า (Supplier)
│   ├── PoInfoSection.tsx          - ส่วนกรอกรายละเอียดหัวเอกสาร (Currency, Ex-Rate)
│   ├── PoTermsSection.tsx         - ส่วนกรอกเงื่อนไขการจ่ายเงินและขนส่ง (Terms)
│   ├── PoItemsSection.tsx         - ตารางจัดการจัดการไอเทมสินค้าเพิ่ม/ลด/แก้ไข
│   ├── PoItemRow.tsx              - แถวข้อมูลย่อยของสินค้าแต่ละตัวพร้อม Input Landed Cost
│   ├── PoTotalsSummary.tsx        - บล็อกคำนวณและแสดงผลสรุปยอดรวมท้ายฟอร์ม
│   ├── PoAttachmentSection.tsx    - จุดอัปโหลดไฟล์เอกสารแนบเพิ่มเติม
│   ├── PoFormBar.tsx              - แถบเมนูด้านบนสุด (ปุ่มบันทึก/ยกเลิก)
│   ├── PoProductSearchContent.tsx - หน้าต่าง Pop-up ค้นหารายการรหัสสินค้าจากคลัง
│   └── PoPdfPreviewContent.tsx    - หน้าต่าง Preview แสดงหน้าตาเอกสารก่อนทำการส่งออก
│
├── 📂 ReceiveDialog/               # หน้าต่างบันทึกการรับของเข้าคลัง (Goods Receipt Modal)
│   ├── index.tsx                  - หน้าต่างหลักคุมฟอร์มบันทึกการรับของ
│   ├── ReceiveHeaderFields.tsx    - ส่วนกรอกข้อมูลหัวใบรับ เช่น เลขที่ GR, วันที่, ชื่อผู้รับ
│   └── ReceiveItemRow.tsx         - แถวระบุจำนวนที่รับจริง, เลข Lot และจุดจัดเก็บสินค้า
│
└── 📄 PoStatusChip.tsx             - Badge แสดงสถานะและสีประจำสเตตัส (Shared Component)

```

---

## 💾 7. State Management Strategy

แบ่งการบริหารจัดการข้อมูลออกเป็น 2 ระดับ เพื่อแยก Server State ออกจาก Local UI State อย่างชัดเจน:

### 1. React Query (Server State Cache)

จัดการข้าข้อมูลไป-กลับระหว่าง Client และ Server ผ่านไฟล์ `po.api.ts`

* **Queries:** `usePoList(filter)`, `usePo(id)`, `usePoSummary()`
* **Mutations:** `useCreatePo()`, `useUpdatePo(id)`, `useChangePoStatus(id)`, `useReceivePo(id)`, `useDeletePo()`
* ♻️ **Data Invalidation Rule:** ทุกๆ การเรียกใช้งาน Mutation ที่สำเร็จ (`onSuccess`) จะทำการสั่งทำลายแคช (`invalidateQueries`) บนคีย์ของชุดข้อมูลชุดนั้นทันที เพื่อบังคับให้ UI อัปเดตข้อมูลสดใหม่โดยไม่ต้องรีโหลดหน้าเว็บ

### 2. Zustand (UI State)

เก็บสถานะการทำงานบนหน้าจอ เช่น ตัวกรองการค้นหาใน `poFilterStore.ts` เพื่อป้องกันไม่ให้เกิดการยิง API ถี่เกินไปในระหว่างที่ผู้ใช้งานพิมพ์ข้อมูล (Debounce / Pending State)

```typescript
{
  status: "",            // สถานะที่ทำการสั่งค้นหาไปแล้ว
  supplierId: null,      // รหัสคู่ค้าที่สั่งค้นหาไปแล้ว
  search: "",            // คำค้นหาที่บันทึกผลแล้ว
  pendingSearch: "",     // คำที่กำลังพิมพ์อยู่ (ยังไม่กด Apply)
  pendingSupplierId: null,
  pendingStatus: "",
}

```

---

## 🔒 8. Dual-Layer Form Validation

ระบบตรวจสอบข้อมูล 2 ชั้น ป้องกันข้อมูลที่ผิดพลาดหลุดรอดเข้าสู่ระบบฐานข้อมูล

### ชั้นที่ 1: Frontend Validation (Zod Schema)

ตรวจสอบโครงสร้างของข้อมูลก่อนส่งออกจากเบราว์เซอร์ผ่าน `po.schema.ts` เพื่อแจ้งเตือนจุดที่กรอกผิดพลาดให้ผู้ใช้งานทราบทันที

```typescript
export const poCreateSchema = z.object({
  supplierId: z.number({ required_error: "กรุณาระบุคู่ค้า" }),
  currency: z.string().default("USD"),
  exchangeRate: z.number().min(0.01, "อัตราแลกเปลี่ยนต้องมากกว่า 0"),
  items: z.array(poItemSchema).min(1, "ต้องมีสินค้าอย่างน้อย 1 รายการ")
})

```

### ชั้นที่ 2: Backend Validation (TypeBox / Elysia)

ตรวจสอบโครงสร้างข้อมูลที่เข้ามายัง Endpoint ในไฟล์ `route.ts` อีกครั้งเพื่อความปลอดภัยสูงสุดและบล็อกข้อมูลแปลกปลอมทันที

🛑 **Export PDF Blocker (กฎเหล็กก่อนออกเอกสาร):**
ระบบมีฟังก์ชันตรวจสอบความสมบูรณ์ของเอกสารผ่าน `getPoExportBlockers()` หากข้อมูลดังต่อไปนี้ไม่ครบถ้วน ปุ่มส่งออก PDF จะถูกล็อก (Disabled) พร้อมแสดง Tooltip แจ้งเตือน:

* ต้องมี Supplier, สกุลเงิน และ Exchange Rate ต้องมากกว่า 0
* ต้องระบุเงื่อนไขและกำหนดส่งมอบครบถ้วน (Expected Date, Payment & Delivery Term)
* สินค้าทุกชิ้นต้องระบุ จำนวน, หน่วย, ราคา EXW ครบถ้วน (ค่า Freight/Tax ต้อง $\ge 0$)

---

## 🖨️ 9. Server-Side PDF Export Flow

สถาปัตยกรรมตัดปัญหาเรื่อง Layout และ Font ภาษาไทยเพี้ยน ด้วยการเลือกใช้เทคนิคเรนเดอร์เอกสารผ่าน **Server-Side Puppeteer Engine** แทนการสร้างบน Client

```
[ Frontend: กดปุ่ม Export ] ──► เรียก downloadPoPdf() ส่ง HTTP GET ไปที่ Backend
                                         │
                                         ▼
                                [ Backend Server ]
                                         │
 1. ดึงข้อมูลจากฐานข้อมูล ◄──────────────┴──────────────► 2. buildHtml() ประกอบโครงสร้าง
 (PO, Items, Supplier Info)                             (ใช้ HTML + Inline CSS + Font Sarabun)
                                                                 │
                                                                 ▼
 4. ส่งไฟล์ Buffer กลับเป็น Stream ◄── 3. Puppeteer แปลงไฟล์ HTML เป็น PDF (A4 ขนาดพอดี)
               │
               ▼
[ Frontend: ได้รับ Blob Data ] ──► ทำการจำลองจำลองคลิกดาวน์โหลดอัตโนมัติลงเครื่องผู้ใช้
               │
               ▼
[ Backend: เปลี่ยนสถานะอัตโนมัติ ] ──► เปลี่ยนแปลงสถานะเอกสาร PO จาก "draft" สู่ "issued"

```

* **จุดเด่นของไฟล์ PDF:** มีแบนเนอร์โลโก้บริษัท, ตารางแจกแจงราคาทั้งรูปแบบสกุลเงินต่างประเทศและ THB, ฟังก์ชันแปลงยอดสุทธิเป็น **ตัวอักษรภาษาไทย** (เช่น *"สี่หมื่นห้าพันร้อยห้าสิบแปดบาทถ้วน"*) และพื้นที่สำหรับเซ็นอนุมัติ 3 ช่องมาตรฐาน

---

## 📦 10. Cumulative Receiving System (Goods Receipt)

ระบบรองรับการรับสินค้าเข้าคลังแบบแบ่งรับหลายงวด (Partial Receipts) โดยเก็บประวัติการรับสินค้าทั้งหมดไว้ในระบบอย่างแม่นยำ

### แผนผังขั้นตอนการรับสินค้า (Receiving Flow)

```
[คลิกปุ่ม Receive ในหน้าดีเทล] ──► เปิด ReceiveDialog กรอกข้อมูลใบรับของ (GR Number, วันที่, Lot, คลัง)
                                                       │
                                                       ▼
[ระบบเปลี่ยนสถานะและประวัติอัตโนมัติ] ◄── ยิงคำสั่ง POST /purchase-orders/:id/receipts ไปที่ Server

```

### ตรรกะการสะสมยอดรับสินค้า (Cumulative Logic)

สมมติใบสั่งซื้อ (PO) สั่งสินค้าจำนวนทั้งหมด **200 ชิ้น**

* **รับสินค้าครั้งที่ 1:** ส่งมา 50 ชิ้น $\rightarrow$ `quantityReceived` สะสม = 50 ชิ้น $\rightarrow$ ระบบอัปเดตสถานะเป็น `partial_received` 🟡
* **รับสินค้าครั้งที่ 2:** ส่งมา 100 ชิ้น $\rightarrow$ `quantityReceived` สะสม = 150 ชิ้น $\rightarrow$ คงสถานะไว้ที่ `partial_received` 🟡
* **รับสินค้าครั้งที่ 3:** ส่งมาอีก 50 ชิ้น $\rightarrow$ `quantityReceived` สะสม = 200 ชิ้น $\rightarrow$ ระบบขยับสถานะเป็น `received` อัตโนมัติ 🟢

### การคำนวณจำนวนสินค้าที่เหลือ (Remaining Column)

ในส่วนหน้าจอส่วน `PoItemsTab.tsx` จะแสดงจำนวนสินค้าคงเหลือให้ผู้ใช้ทราบแบบ Real-time:

```typescript
const remainingQty = item.quantity - (receivedMap[item.id] ?? 0);

```

* ถ้า `remainingQty > 0` $\rightarrow$ แสดงตัวเลขแจ้งเตือน **สีเหลือง** (ยังรับของไม่ครบ)
* ถ้า `remainingQty = 0` $\rightarrow$ แสดงเครื่องหมายสำเร็จ **สีเขียว** (รับของครบถ้วนแล้ว) และทำการปิดล็อกปุ่มบันทึกรับของทันที

---

## 🔒 11. Core Implementation Details

### 🧩 1. Auto-Number Generation

ตัวระบบสร้างเลขที่ใบสั่งซื้ออัตโนมัติจากฝั่ง Server เพื่อป้องกันปัญหาเลขเอกสารซ้ำกันเมื่อมีผู้ใช้งานสั่งเปิดฟอร์มพร้อมกัน (Race Condition) โดยใช้ Format: `PO-[ปี ค.ศ.]-[ยอดนับสะสมในปีนั้น + 1]` เช่น **PO-2026-0001**

### 🏢 2. Multi-Tenant Security Isolation

เพื่อความปลอดภัยของข้อมูลขั้นสูงสุด ทุกๆ คำสั่งคิวรีในระดับ Repository Layer จะต้องถูกพ่วงเงื่อนไขตรวจสอบสิทธิ์และกรองลบข้อมูล (Soft-Deleted Data) เสมอ โดยดึงรหัสองค์กรมาจาก JWT Token ของผู้เข้าใช้งานโดยตรง

```typescript
where: and(
  eq(purchaseOrders.tenantId, currentTenantId), // ตรวจสอบความถูกต้องของสิทธิ์เจ้าของข้อมูล
  isNull(purchaseOrders.deletedAt)              // ข้ามข้อมูลที่โดนสั่ง Soft Delete ไปแล้ว
)

```

### 🤝 3. Monorepo Shared Types Design

โครงการพัฒนาในรูปแบบ Bun Workspace ส่งผลให้โฟลเดอร์ `shared/` กลายเป็นจุดศูนย์กลางรวบรวมรูปแบบ Types, Constants และรหัสส่งกลับ Error Code ชุดเดียวกัน

```
flowmerce/
├── 📂 shared/      ──► บรรจุ types.ts (เช่น PoStatus, CreatePoInput) นำไปแชร์ใช้งานคู่กัน
├── 📂 server/      ──► อ้างอิงนำไปใช้ตรวจสอบโครงสร้าง Input ของ API
└── 📂 frontend/    ──► อ้างอิงนำไปใช้ในการ Compile ตรวจจับบักบนฟอร์มหน้าบ้าน

```

*ประโยชน์หลัก: เมื่อทางฝั่ง Backend มีการเปลี่ยนแปลงโครงสร้างโครงสร้างฟิลด์ใดๆ ตัวคอมไพเลอร์ของ TypeScript จะแจ้งเตือนข้อผิดพลาดที่ฝั่ง Frontend ทันที ช่วยลดบั๊กตอน Deploy งานได้อย่างมหาศาล*

---

## 📊 12. สรุป Design Decisions

| หัวข้อ | แนวทางการออกแบบ (How) | เหตุผลสำคัญทางธุรกิจ (Why) |
| --- | --- | --- |
| **Status Controlling** | State Machine แบบ Strict เขียน Hardcode ใน `service.ts` | ป้องกันสถานะเอกสารสับสน เช่น ปิดใบ PO ทั้งที่คลังยังไม่ได้รับของ |
| **Landed Cost** | คำนวณสูตรแฝงครบ 6 ขั้น บันทึกลงหน้าตารางทันทีที่บันทึก | ธุรกิจ Trader ต้องรู้ต้นทุนจริงหลังรวมค่าใช้จ่าย ราคาโรงงาน (EXW) อย่างเดียวไม่พอ |
| **Soft Delete** | ใช้วิธีเปลี่ยนค่าในฟิลด์ `deletedAt` แทนการลบแถว Row | ข้อมูลธุรกรรมทางบัญชีต้องไม่สูญหาย เพื่อให้สามารถทำ Audit ย้อนหลังได้ |
| **Database Transaction** | มัดคำสั่งอัปเดต Status และการเขียน History Log ไว้ในคิวรีเดียวกัน | รับประกันความถูกต้องของประวัติ ไม่มีกรณีที่สถานะเปลี่ยนแต่ระบบลืมบันทึก Log |
| **Auto Status Change** | ตรวจเช็กและเปลี่ยนสเตตัสอัตโนมัติทันทีหลังรับของครบ | ลดภาระการทำงานและ Human Error ที่เกิดจากการลืมกดเปลี่ยนสถานะของผู้ใช้ |
| **PDF Processing** | สั่งใช้งาน Puppeteer รันงานหลังบ้าน (Server-Side) | แก้ไขปัญหา Font ภาษาไทยพัง และช่วยให้การจัดรูปแบบ Layout หน้ากระดาษ A4 สม่ำเสมอ |
| **Data Layering** | แยก Codebase ออกเป็น 4 เลเยอร์ (Route -> Handler -> Service -> Repo) | แต่ละชั้นมีหน้าที่ชัดเจน สามารถแยกกันเขียน ย้ายฐานข้อมูล หรือเขียน Unit Test ได้ง่าย |
| **Server State** | นำระบบ React Query เข้ามาคุมกลไกการ Cache และทำ Invalidation | หน้าบ้านแสดงผลสอดคล้องกับฐานข้อมูลหลังบ้านแบบ Real-time โดยไม่ต้อง Reload หน้าเพจ |
| **Double Verification** | ผสมผสานระบบ Validation 2 ชั้น (Zod หน้าบ้าน + TypeBox หลังบ้าน) | คัดกรองและสกัดข้อมูลที่ผิดรูปแบบตั้งแต่ต้นทาง ไม่ให้เข้าไปรบกวนฐานข้อมูลหลัก |
| **Shared Resource** | แยก Module ของ Type และ Enum ออกมาไว้ที่โฟลเดอร์ส่วนกลาง | ป้องกันระบบพังเมื่อมีการปรับแก้โครงสร้างข้อมูล (Compile-time Verification) |

---

## 💡 สิ่งที่พูดได้ชัดๆ ตอนหัวหน้าถามว่า "ออกแบบระบบนี้ยังไง"

> *"ระบบนี้ออกแบบมาสำหรับบริษัท Trader โดยเฉพาะครับ/ค่ะ หัวใจคือ State Machine ที่ควบคุม lifecycle ของ PO ตั้งแต่ draft จนถึง closed โดยระบบจัดการ transition บางส่วนให้อัตโนมัติ เช่น การ เปลี่ยนเป็น issued หลัง export PDF และการเปลี่ยน status หลังรับของ สิ่งที่พิเศษกว่า PO ทั่วไปคือการคำนวณ Landed Cost ที่รวมค่าใช้จ่ายนำเข้าทั้งหมด ทำให้รู้ต้นทุนจริงต่อหน่วยก่อนนำสินค้าเข้าคลัง Architecture ใช้ 4 layers แยกชัดเจน และเก็บ audit log ทุกการกระทำ เพราะข้อมูลบัญชีต้อง trace ได้"*