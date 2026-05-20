import { Elysia }     from "elysia"
import { AppError }   from "./errors"
import { logger }     from "./logger"
import { ErrorCodes } from "../../../shared/errors"

function isSqliteError(err: unknown): err is { code: string; message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string" &&
    (err as { code: string }).code.startsWith("SQLITE_")
  )
}

export function errorHandler(app: Elysia) {
  return app.onError(({ error, set, request }) => {
    const path = new URL(request.url).pathname

    if (error instanceof AppError) {
      logger.warn({
        type:    "app_error",
        code:    error.code,
        message: error.message,
        details: error.details,
        path,
      })
      set.status = error.statusCode
      return {
        ok:      false,
        code:    error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      }
    }

    if (isSqliteError(error)) {
      logger.warn({ type: "sqlite_error", code: error.code, path })
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        set.status = 409
        return { ok: false, code: ErrorCodes.INTERNAL_ERROR, message: "ข้อมูลซ้ำ" }
      }
      if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        set.status = 400
        return { ok: false, code: ErrorCodes.VALIDATION_ERROR, message: "อ้างอิงข้อมูลที่ไม่มีอยู่" }
      }
    }

    logger.error({
      type:    "unexpected_error",
      message: error instanceof Error ? error.message : String(error),
      stack:   error instanceof Error ? error.stack   : undefined,
      path,
    })
    set.status = 500
    return {
      ok:      false,
      code:    ErrorCodes.INTERNAL_ERROR,
      message: "เกิดข้อผิดพลาดภายใน กรุณาลองใหม่",
    }
  })
}
