import { Elysia }         from "elysia"
import { cors }           from "@elysiajs/cors"
import { staticPlugin }   from "@elysiajs/static"
import { rateLimit }      from "elysia-rate-limit"
import path               from "path"
import { errorHandler }   from "./lib/error-handler"
import { logger }         from "./lib/logger"
import { ErrorCodes }     from "../../shared/errors"
import { uploadRoute }    from "./modules/upload/handler"
import { chatRoute }      from "./modules/chat/handler"
import { emailRoute }     from "./modules/email/handler"
import { quoteRoute }     from "./modules/quotes/handler"
import { authRoute }      from "./modules/auth/handler"
import { mailboxRoute }   from "./modules/mailbox/handler"
import { customerRoute }      from "./modules/customers/handler"
import { supplierRoute }      from "./modules/suppliers/handler"
import { productRoute }       from "./modules/products/handler"
import { importRoute }        from "./modules/import/handler"
import { reportRoute, notificationRoute }  from "./modules/reporting/handler"
import { poRoute }            from "./modules/po/route"
import { usersRoute }         from "./modules/users/handler"

const app = new Elysia()
  .use(cors())
  .use(errorHandler)

  .onRequest(({ request }) => {
    logger.info({
      type:   "request",
      method: request.method,
      path:   new URL(request.url).pathname,
    })
  })

  .onAfterHandle(({ request, set }) => {
    logger.info({
      type:   "response",
      method: request.method,
      path:   new URL(request.url).pathname,
      status: set.status ?? 200,
    })
  })

  // ── All API routes under /api prefix ─────────────────────
  .use(
    new Elysia({ prefix: "/api" })
      // Core / master-data routes (no rate limit)
      .use(uploadRoute)
      .use(authRoute)
      .use(mailboxRoute)
      .use(customerRoute)
      .use(supplierRoute)
      .use(productRoute)
      .use(importRoute)
      .use(quoteRoute)
      .use(poRoute)
      .use(usersRoute)
      .use(reportRoute)
      .use(notificationRoute)
      // AI routes — rate limited (20 req/min/IP)
      .use(
        new Elysia()
          .use(rateLimit({
            duration: 60_000,
            max:      20,
            errorResponse: new Response(
              JSON.stringify({
                ok:      false,
                code:    ErrorCodes.RATE_LIMIT_EXCEEDED,
                message: "ส่งคำขอมากเกินไป กรุณารอ 1 นาทีแล้วลองใหม่",
              }),
              { status: 429, headers: { "Content-Type": "application/json" } }
            ),
          }))
          .use(chatRoute)
          .use(emailRoute)
      )
  )

  .get("/health", () => ({ ok: true, timestamp: new Date().toISOString() }))

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(import.meta.dir, "../../frontend/dist")
  app
    .use(staticPlugin({ assets: distPath, prefix: "/" }))
    .get("*", ({ set }) => {
      set.headers["Content-Type"] = "text/html"
      return Bun.file(path.join(distPath, "index.html"))
    })
}

app.listen(process.env.PORT ?? 1422)

logger.info({ type: "startup", port: app.server?.port, msg: "Flowmerce server running" })
