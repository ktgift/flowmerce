# Project: Flowmerce — Frontend Working Rules

## Monorepo Context
นี่คือ frontend ของ Bun workspace ที่ root อยู่หนึ่งระดับเหนือ folder นี้:
```
flowmerce/                ← workspace root (Bun)
├── shared/               ← ⭐ SOURCE OF TRUTH (ห้าม copy types ไปไว้ที่อื่น)
│   ├── types.ts          ← ทุก domain type + API request/response shape
│   ├── constants.ts      ← shared enums (status, role, vertical, provider)
│   └── errors.ts         ← ErrorCodes + ErrorResponse shape
├── server/               ← Backend (Bun + Elysia) — frontend ไม่แตะ
└── frontend/             ← ⭐ ทำงานที่นี่
    └── src/...
```

Workspace packages: `@flowmerce/shared`, `@flowmerce/server`, `@flowmerce/frontend`

## Stack
React 18 + Vite + TypeScript + MUI v5 + @tanstack/react-query v5 + Zustand + 
react-hook-form + zod + react-router-dom v6 + axios + dayjs

## Folder Structure (ห้ามย้าย เพิ่มได้)
```
frontend/src/
├── App.tsx
├── main.tsx
├── index.css
├── assets/{fonts,images}/
├── components/
│   ├── common/           # Reusable UI (Form*, Table, StatusBadge, ...)
│   ├── container/        # Feature modules
│   │   ├── customer/  supplier/  product/
│   │   ├── quotation/  purchaseOrder/  receiving/
│   │   ├── upload/  chat/  email/  quote/  mailbox/
│   │   ├── import/  report/  notification/
│   │   ├── auth/  user/  role/
│   │   ├── setting/  home/
│   ├── context/          # ThemeContext, RoleContext, LoaderContext
│   └── layout/           # Header, Sidebar, Main, MobileLayout
└── lib/
    ├── api/              # axios.ts, factory.ts, queryClient.ts, *.api.ts, index.ts
    ├── @types/           # ⚠️ FRONTEND-ONLY types เท่านั้น (UI state, form, hook)
    ├── config/           # auth.ts, router.ts, http.ts, endpoints.ts
    ├── constants/        # FRONTEND-ONLY constants (route paths, query keys)
    ├── hoc/              # withAuth, withRole
    ├── hook/             # useAuth, useDebounce
    ├── model/            # Frontend domain models (ถ้าต้อง map จาก shared)
    ├── schema/           # zod schemas สำหรับ form validation
    ├── store/            # zustand stores
    ├── services/         # loaderService, mockApi
    ├── transform/        # API ↔ Model mappers (ถ้า shape ต่างกัน)
    └── utils/            # date, money, string helpers
```

## ⚠️ Type Placement Rules (สำคัญที่สุด)

| ประเภท                                      | ที่ถูกต้อง                                    |
|--------------------------------------------|----------------------------------------------|
| Domain entity (Customer, Quote, PO, ...)   | `@flowmerce/shared/types`                    |
| API request/response shape                 | `@flowmerce/shared/types`                    |
| Domain enum (status, role, vertical)       | `@flowmerce/shared/constants`                |
| Error code & ErrorResponse shape           | `@flowmerce/shared/errors`                   |
| UI state (modal open, tab index)           | `lib/@types/`                                |
| Form types ที่ infer จาก zod               | `lib/schema/` (z.infer)                      |
| Hook return type                           | `lib/@types/` หรือ inline                    |
| Component prop                             | inline ใน .tsx                               |

**ห้าม redeclare type ที่มีอยู่ใน `@flowmerce/shared`** ถ้าต้องเพิ่ม field ให้ extend:
```ts
// ✅ ดี
import type { Customer } from "@flowmerce/shared/types"
interface CustomerListRow extends Customer { selected: boolean }

// ❌ ห้าม
interface Customer { id: string; ... }  // ซ้ำกับใน shared
```

## กฎเหล็ก
1. **API discipline**: ทุก HTTP call ต้องผ่าน hooks ใน `lib/api/*.api.ts` 
   ห้ามเรียก axios จาก component/store
2. **No hard-coded paths**: ทุก endpoint path ประกาศใน `lib/config/endpoints.ts`
3. **Shared first**: ก่อนสร้าง type ใหม่ ต้องเช็คใน `@flowmerce/shared/types` ก่อนเสมอ
4. **Zod = source of truth สำหรับ form**: schema อยู่ใน `lib/schema/` 
   ใช้ `z.infer` — แต่ถ้า shape ตรงกับ shared/types ให้อ้าง shared แทน
5. **Mutation invalidation**: ทุก useMutation ต้อง invalidate query keys 
   ที่เกี่ยวข้องใน `onSuccess` หรือ `meta.invalidates`
6. **Auth**: JWT token เก็บ localStorage key = `"auth_token"` 
   อ่าน/เขียน/ลบผ่าน `lib/config/auth.ts` เท่านั้น
7. **Loader**: ใช้ `requestCount` ใน `lib/services/loaderService.ts` 
   interceptor inc/dec อัตโนมัติ
8. **Error 401**: response interceptor → `clearToken()` + redirect `/login`
9. **Type style**: `interface` สำหรับ object shape, `type` สำหรับ union/utility
10. **Import order**: react → 3rd-party → `@flowmerce/shared/*` → `@/lib` → `@/components` → relative
11. **No `any`**: ถ้าจำเป็นต้องมี comment `// any: <reason>` 1 บรรทัดเหนือ

## Path Aliases (ต้องตั้งใน tsconfig.json + vite.config.ts)
- `@/*` → `frontend/src/*`
- `@flowmerce/shared` resolved ผ่าน workspace (bun install จัดการ)

## Backend Contract
- Base URL: `VITE_API_BASE_URL` (default `http://localhost:1422`)
- Auth: `Authorization: Bearer <JWT>` (TenantId อ่านจาก JWT ฝั่ง backend)
- Error response: import `ErrorResponse` จาก `@flowmerce/shared/errors`
- Pagination shape:
  ```ts
  { items: T[]; total: number; page: number; pageSize: number }
  ```
- SSE endpoints: `/chat/ask`, `/email/reply`, `/quote/generate`, 
  `/quotations/ai-draft` — ใช้ `apiStream` helper แยก ไม่ผ่าน factory

## React Query Convention
- Query key: `[feature, action, ...params]` 
  เช่น `["customers", "list", { page: 1 }]`
- Default ใน `lib/api/queryClient.ts`:
  staleTime 30s, gcTime 5m, retry 1, refetchOnWindowFocus false

## Workflow
1. ก่อนสร้าง type ใหม่ — **เปิด `@flowmerce/shared/types` ดูก่อน**
2. ถ้าต้องเพิ่ม shared type — **แจ้งผู้ใช้ก่อน อย่าแก้เอง** (กระทบ backend)
3. ทุก feature ลำดับ: endpoints.ts → *.api.ts → schema → component
4. หลังจบ milestone อัปเดต checklist ด้านล่าง

## งานที่ทำเสร็จแล้ว
- [x] M0: CLAUDE.md + path alias setup
- [x] M1: Frontend config + frontend-only types
- [ ] M2: API Core (axios + factory + queryClient + loaderService)
- [ ] M3a: auth + user APIs
- [ ] M3b: customer + supplier APIs
- [ ] M3c: product + upload APIs
- [ ] M3d: quotation + purchaseOrder APIs
- [ ] M3e: chat + email + quote(legacy) + mailbox APIs
- [ ] M3f: import + report + notification APIs
- [ ] M3g: lib/api/index.ts re-export
- [ ] M4: Router + Layout + Theme + Context
- [ ] M5+: feature pages (per domain)