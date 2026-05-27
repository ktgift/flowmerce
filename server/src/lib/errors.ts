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
  constructor(message = "Not found", code: ErrorCode = ErrorCodes.NOT_FOUND) {
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
    new BadRequestError("No uploaded file found"),

  UNSUPPORTED_FORMAT: (ext: string) =>
    new AppError(`Unsupported file format: .${ext}`, 400, ErrorCodes.UNSUPPORTED_FORMAT, { ext }),

  PARSE_FAILED: (name: string) =>
    new AppError(`Failed to read file: ${name}`, 422, ErrorCodes.PARSE_FAILED, { fileName: name }),

  SESSION_EMPTY: () =>
    new NotFoundError("No files in this session. Please upload a file first.", ErrorCodes.SESSION_EMPTY),

  NO_RELEVANT_CHUNKS: () =>
    new NotFoundError("No relevant data found in the uploaded file.", ErrorCodes.NO_RELEVANT_CHUNKS),

  NOT_LOGGED_IN: (provider: string) =>
    new UnauthorizedError(`Not logged in to ${provider}. Please log in first.`, ErrorCodes.NOT_LOGGED_IN),

  TOKEN_EXPIRED: () =>
    new UnauthorizedError("Session expired. Please log in again.", ErrorCodes.TOKEN_EXPIRED),

  MAIL_FETCH_FAILED: (cause?: unknown) =>
    new AppError("Failed to fetch mail. Please try again.", 502, ErrorCodes.MAIL_FETCH_FAILED,
      cause ? { cause: String(cause) } : undefined),

  DRAFT_NOT_FOUND: () =>
    new NotFoundError("Draft not found.", ErrorCodes.DRAFT_NOT_FOUND),

  EMAIL_NOT_FOUND: () =>
    new NotFoundError("Source email not found.", ErrorCodes.EMAIL_NOT_FOUND),

  SEND_FAILED: (cause?: unknown) =>
    new AppError("Failed to send email. Please try again.", 502, ErrorCodes.SEND_FAILED,
      cause ? { cause: String(cause) } : undefined),

  AI_FAILED: (cause?: unknown) =>
    new AppError("AI processing failed. Please try again.", 502, ErrorCodes.AI_FAILED,
      cause ? { cause: String(cause) } : undefined),

  CUSTOMER_NOT_FOUND: () =>
    new NotFoundError("Customer not found.", ErrorCodes.CUSTOMER_NOT_FOUND),

  SUPPLIER_NOT_FOUND: () =>
    new NotFoundError("Supplier not found.", ErrorCodes.SUPPLIER_NOT_FOUND),

  PRODUCT_NOT_FOUND: () =>
    new NotFoundError("Product not found.", ErrorCodes.PRODUCT_NOT_FOUND),

  IMPORT_PARSE_FAILED: (cause?: unknown) =>
    new AppError("Failed to read import file.", 422, ErrorCodes.IMPORT_PARSE_FAILED,
      cause ? { cause: String(cause) } : undefined),

  IMPORT_NO_MAPPING: () =>
    new BadRequestError("No column mapping found. Please check the template."),

  IMPORT_TEMPLATE_NOT_FOUND: () =>
    new NotFoundError("Import template not found.", ErrorCodes.IMPORT_TEMPLATE_NOT_FOUND),

  QUOTE_NOT_FOUND: () =>
    new NotFoundError("Quotation not found.", ErrorCodes.QUOTE_NOT_FOUND),

  QUOTE_INVALID_ITEM: (msg: string) =>
    new BadRequestError(`Invalid item: ${msg}`),

  MISSING_PROJECT_NAME: () =>
    new BadRequestError("Project name is required."),

  PO_NOT_FOUND: () =>
    new NotFoundError("Purchase order not found.", ErrorCodes.PO_NOT_FOUND),

  PO_INVALID_STATUS: (from: string, to: string) =>
    new BadRequestError(`Cannot change status from "${from}" to "${to}".`),

  PO_CANNOT_EDIT: (status: string) =>
    new AppError(
      `Cannot edit a purchase order with status "${status}".`,
      400,
      ErrorCodes.PO_INVALID_STATUS,
    ),

  RECEIPT_NOT_FOUND: () =>
    new NotFoundError("Receipt not found.", ErrorCodes.RECEIPT_NOT_FOUND),

  USER_NOT_FOUND: () =>
    new NotFoundError("User not found.", ErrorCodes.USER_NOT_FOUND),

  USER_ALREADY_EXISTS: () =>
    new AppError("This email is already registered.", 409, ErrorCodes.USER_ALREADY_EXISTS),

  INVALID_CREDENTIALS: () =>
    new UnauthorizedError("Invalid email or password.", ErrorCodes.INVALID_CREDENTIALS),

  INVALID_TOKEN: () =>
    new UnauthorizedError("Invalid or expired token. Please log in again.", ErrorCodes.INVALID_TOKEN),

  AUTH_REQUIRED: () =>
    new UnauthorizedError("Authentication required. Please log in.", ErrorCodes.AUTH_REQUIRED),

  FORBIDDEN: () =>
    new AppError("You do not have permission to perform this action.", 403, ErrorCodes.FORBIDDEN),
} as const
