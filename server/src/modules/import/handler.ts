import { Elysia, t }        from "elysia"
import { tenantMiddleware } from "../../middleware/tenant"
import { importService }    from "./service"
import type { TargetTable } from "../../lib/import/columnMatcher"

const handler = {

  suggest: (buffer: Buffer, targetTable: TargetTable, tenantId: number, fileName: string) =>
    importService.parseAndSuggest(buffer, targetTable, tenantId, fileName),

  listTemplates: (tenantId: number) =>
    importService.listTemplates(tenantId),

  saveTemplate: (tenantId: number, name: string, targetTable: TargetTable, columnMapping: Record<string, string>) =>
    importService.saveTemplate(tenantId, name, targetTable, columnMapping),

  execute: (
    tenantId:      number,
    buffer:        Buffer,
    fileName:      string,
    targetTable:   TargetTable,
    columnMapping: Record<string, string>,
    sheetName?:    string,
    upsertKey?:    string,
    dryRun?:       boolean,
  ) => importService.executeImport(tenantId, buffer, fileName, targetTable, columnMapping, sheetName, upsertKey, dryRun),
}

const TARGET_TABLES = ["trader_products", "customers", "suppliers"] as const

export const importRoute = new Elysia({ prefix: "/import" })
  .use(tenantMiddleware)

  // GET /import/templates – list saved templates
  .get("/templates", async ({ tenantId }) => {
    const data = await handler.listTemplates(tenantId)
    return { success: true, data }
  })

  // POST /import/suggest – parse Excel and suggest column mapping
  .post("/suggest", async ({ tenantId, body }) => {
    const fileContent = body.file
    const buffer = Buffer.from(await fileContent.arrayBuffer())
    const data = await handler.suggest(buffer, body.targetTable as TargetTable, tenantId, fileContent.name)
    return { success: true, data }
  }, {
    body: t.Object({
      file:        t.File(),
      targetTable: t.Union(TARGET_TABLES.map(v => t.Literal(v))),
    }),
  })

  // POST /import/templates – save a column mapping template
  .post("/templates", async ({ tenantId, body, set }) => {
    const data = await handler.saveTemplate(tenantId, body.name, body.targetTable as TargetTable, body.columnMapping)
    set.status = 201
    return { success: true, data }
  }, {
    body: t.Object({
      name:          t.String({ minLength: 1 }),
      targetTable:   t.Union(TARGET_TABLES.map(v => t.Literal(v))),
      columnMapping: t.Record(t.String(), t.String()),
    }),
  })

  // POST /import/execute – run the actual import
  .post("/execute", async ({ tenantId, body }) => {
    const fileContent = body.file
    const buffer = Buffer.from(await fileContent.arrayBuffer())
    const data = await handler.execute(
      tenantId,
      buffer,
      fileContent.name,
      body.targetTable as TargetTable,
      body.columnMapping,
      body.sheetName,
      body.upsertKey,
      body.dryRun,
    )
    return { success: true, data }
  }, {
    body: t.Object({
      file:          t.File(),
      targetTable:   t.Union(TARGET_TABLES.map(v => t.Literal(v))),
      columnMapping: t.Record(t.String(), t.String()),
      sheetName:     t.Optional(t.String()),
      upsertKey:     t.Optional(t.String()),
      dryRun:        t.Optional(t.BooleanString()),
    }),
  })
