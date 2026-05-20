import { ErrorCodes, type ErrorCode } from "../../../shared/errors"

export class AppError extends Error {
  public readonly isOperational = true

  constructor(
    public readonly message:    string,
    public readonly statusCode: number    = 500,
    public readonly code:       ErrorCode = ErrorCodes.INTERNAL_ERROR,
    public readonly details?:   Record<string, unknown>,
  ) {
    super(message)
    this.name = "AppError"
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: Record<string, unknown>) {
    super(message, 400, ErrorCodes.VALIDATION_ERROR, details)
    this.name = "BadRequestError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code: ErrorCode = ErrorCodes.NOT_LOGGED_IN) {
    super(message, 401, code)
    this.name = "UnauthorizedError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", code: ErrorCode = ErrorCodes.INTERNAL_ERROR) {
    super(message, 404, code)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: Record<string, unknown>) {
    super(message, 422, ErrorCodes.VALIDATION_ERROR, details)
    this.name = "ValidationError"
  }
}

export const Errors = {
  NO_FILE: () =>
    new BadRequestError("ไม่พบไฟล์ที่ upload"),

  UNSUPPORTED_FORMAT: (ext: string) =>
    new AppError(`ไม่รองรับไฟล์ .${ext}`, 400, ErrorCodes.UNSUPPORTED_FORMAT, { ext }),

  PARSE_FAILED: (name: string) =>
    new AppError(`อ่านไฟล์ ${name} ไม่ได้`, 422, ErrorCodes.PARSE_FAILED, { fileName: name }),

  SESSION_EMPTY: () =>
    new NotFoundError("ยังไม่มีไฟล์ใน session นี้ กรุณา upload ก่อน", ErrorCodes.SESSION_EMPTY),

  NO_RELEVANT_CHUNKS: () =>
    new NotFoundError("ไม่พบข้อมูลที่เกี่ยวข้องในไฟล์ที่ upload", ErrorCodes.NO_RELEVANT_CHUNKS),

  NOT_LOGGED_IN: (provider: string) =>
    new UnauthorizedError(`ยังไม่ได้ login ${provider} กรุณา login ก่อน`, ErrorCodes.NOT_LOGGED_IN),

  TOKEN_EXPIRED: () =>
    new UnauthorizedError("session หมดอายุ กรุณา login ใหม่", ErrorCodes.TOKEN_EXPIRED),

  MAIL_FETCH_FAILED: (cause?: unknown) =>
    new AppError("ดึงเมลไม่สำเร็จ กรุณาลองใหม่", 502, ErrorCodes.MAIL_FETCH_FAILED,
      cause ? { cause: String(cause) } : undefined),

  DRAFT_NOT_FOUND: () =>
    new NotFoundError("ไม่พบ draft", ErrorCodes.DRAFT_NOT_FOUND),

  EMAIL_NOT_FOUND: () =>
    new NotFoundError("ไม่พบเมลต้นทาง", ErrorCodes.EMAIL_NOT_FOUND),

  SEND_FAILED: (cause?: unknown) =>
    new AppError("ส่งเมลไม่สำเร็จ กรุณาลองใหม่", 502, ErrorCodes.SEND_FAILED,
      cause ? { cause: String(cause) } : undefined),

  AI_FAILED: (cause?: unknown) =>
    new AppError("AI ประมวลผลไม่สำเร็จ กรุณาลองใหม่", 502, ErrorCodes.AI_FAILED,
      cause ? { cause: String(cause) } : undefined),

  CUSTOMER_NOT_FOUND: () =>
    new NotFoundError("ไม่พบข้อมูลลูกค้า", ErrorCodes.CUSTOMER_NOT_FOUND),

  SUPPLIER_NOT_FOUND: () =>
    new NotFoundError("ไม่พบข้อมูลซัพพลายเออร์", ErrorCodes.SUPPLIER_NOT_FOUND),

  PRODUCT_NOT_FOUND: () =>
    new NotFoundError("ไม่พบข้อมูลสินค้า", ErrorCodes.PRODUCT_NOT_FOUND),

  IMPORT_PARSE_FAILED: (cause?: unknown) =>
    new AppError("อ่านไฟล์นำเข้าไม่ได้", 422, ErrorCodes.IMPORT_PARSE_FAILED,
      cause ? { cause: String(cause) } : undefined),

  IMPORT_NO_MAPPING: () =>
    new BadRequestError("ไม่พบการ mapping คอลัมน์ กรุณาตรวจสอบ template"),

  IMPORT_TEMPLATE_NOT_FOUND: () =>
    new NotFoundError("ไม่พบ import template", ErrorCodes.IMPORT_TEMPLATE_NOT_FOUND),

  QUOTE_NOT_FOUND: () =>
    new NotFoundError("ไม่พบใบเสนอราคา", ErrorCodes.QUOTE_NOT_FOUND),

  QUOTE_INVALID_ITEM: (msg: string) =>
    new BadRequestError(`รายการสินค้าไม่ถูกต้อง: ${msg}`),

  MISSING_PROJECT_NAME: () =>
    new BadRequestError("กรุณาระบุชื่อโครงการ"),

  PO_NOT_FOUND: () =>
    new NotFoundError("ไม่พบใบสั่งซื้อ", ErrorCodes.PO_NOT_FOUND),

  PO_INVALID_STATUS: (from: string, to: string) =>
    new BadRequestError(`ไม่สามารถเปลี่ยนสถานะจาก "${from}" เป็น "${to}" ได้`),

  RECEIPT_NOT_FOUND: () =>
    new NotFoundError("ไม่พบใบรับของ", ErrorCodes.RECEIPT_NOT_FOUND),

  USER_NOT_FOUND: () =>
    new NotFoundError("ไม่พบผู้ใช้งาน", ErrorCodes.USER_NOT_FOUND),

  USER_ALREADY_EXISTS: () =>
    new AppError("อีเมลนี้มีในระบบแล้ว", 409, ErrorCodes.USER_ALREADY_EXISTS),

  INVALID_CREDENTIALS: () =>
    new UnauthorizedError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", ErrorCodes.INVALID_CREDENTIALS),

  INVALID_TOKEN: () =>
    new UnauthorizedError("Token ไม่ถูกต้องหรือหมดอายุ กรุณา login ใหม่", ErrorCodes.INVALID_TOKEN),

  AUTH_REQUIRED: () =>
    new UnauthorizedError("กรุณา login ก่อนใช้งาน", ErrorCodes.AUTH_REQUIRED),

  FORBIDDEN: () =>
    new AppError("ไม่มีสิทธิ์ดำเนินการนี้", 403, ErrorCodes.FORBIDDEN),
} as const
