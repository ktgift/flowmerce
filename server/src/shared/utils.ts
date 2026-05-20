import { PaginationParams } from "@/types/pagination";
import { PAGINATION } from "./constants";

export function toNumber(value: unknown, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  
  const num = Number(value)
  return Number.isNaN(num) ? defaultValue : num
}


export function parsePagination(query: { limit?: string; offset?: string }): PaginationParams {
  // limit ต้องอยู่ระหว่าง MIN และ MAX
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(PAGINATION.MIN_LIMIT, toNumber(query.limit, PAGINATION.DEFAULT_LIMIT))
  )
  
  // offset ต้อง >= 0
  const offset = Math.max(0, toNumber(query.offset, 0))
  
  return { limit, offset }
}


export function isValidId(id: string | number): boolean {
  const num = Number(id)
  //เช็คว่าเป็นตัวเลขที่เป็นจำนวนเต็มบวกเท่านั้น และไม่ใช่ NaN
  return !Number.isNaN(num) && num > 0 && Number.isInteger(num) 
}


export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

