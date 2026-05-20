import { parseExcelBuffer }              from "../../lib/import/excelParser"
import { matchColumns, buildColumnMapping } from "../../lib/import/columnMatcher"
import { validateRow }                   from "../../lib/import/importValidator"
import { importTemplateRepository }      from "./repository"
import { productRepository }             from "../products/repository"
import { customerRepository }            from "../customers/repository"
import { supplierRepository }            from "../suppliers/repository"
import { db }                            from "../../db"
import { importLogs }                    from "../../db/schema"
import { randomUUID }                    from "crypto"
import { Errors }                        from "../../lib/errors"
import type { TargetTable }              from "../../lib/import/columnMatcher"

export const importService = {

  async parseAndSuggest(buffer: Buffer, targetTable: TargetTable, tenantId: number, fileName: string) {
    const sheets = await parseExcelBuffer(buffer).catch(err => { throw Errors.IMPORT_PARSE_FAILED(err) })
    if (sheets.length === 0) throw Errors.IMPORT_PARSE_FAILED("no sheets")

    const sheet   = sheets[0]
    const matches = matchColumns(sheet.headers, targetTable)

    // Try to auto-match a saved template by filename or column headers
    const templates = await importTemplateRepository.findMany(tenantId)
    const relevantTemplates = templates.filter(t => t.targetTable === targetTable)
    const matchedTemplate = findMatchingTemplate(relevantTemplates, fileName, sheet.headers)

    const suggestedMapping = matchedTemplate
      ? matchedTemplate.columnMapping
      : buildColumnMapping(matches)

    return {
      sheets:           sheets.map(s => s.sheetName),
      headers:          sheet.headers,
      matches,
      suggestedMapping,
      matchedTemplate:  matchedTemplate ? { id: matchedTemplate.id, name: matchedTemplate.name } : null,
      rowCount:         sheet.rows.length,
      previewRows:      sheet.rows.slice(0, 8),
    }
  },

  async listTemplates(tenantId: number) {
    return importTemplateRepository.findMany(tenantId)
  },

  async saveTemplate(tenantId: number, name: string, targetTable: TargetTable, columnMapping: Record<string, string>) {
    return importTemplateRepository.create(tenantId, name, targetTable, columnMapping)
  },

  async executeImport(
    tenantId:      number,
    buffer:        Buffer,
    fileName:      string,
    targetTable:   TargetTable,
    columnMapping: Record<string, string>,
    sheetName?:    string,
    upsertKey?:    string,
    dryRun?:       boolean,
  ) {
    const sheets = await parseExcelBuffer(buffer).catch(err => { throw Errors.IMPORT_PARSE_FAILED(err) })
    const sheet  = (sheetName ? sheets.find(s => s.sheetName === sheetName) : undefined) ?? sheets[0]
    if (!sheet)                              throw Errors.IMPORT_PARSE_FAILED("sheet not found")
    if (!Object.keys(columnMapping).length) throw Errors.IMPORT_NO_MAPPING()

    let createdRows = 0
    let updatedRows = 0
    let skippedRows = 0
    const errors: string[] = []

    for (let i = 0; i < sheet.rows.length; i++) {
      const raw    = sheet.rows[i]
      const mapped: Record<string, string> = {}
      for (const [header, field] of Object.entries(columnMapping)) {
        mapped[field] = raw[header] ?? ""
      }

      const rowErrors = validateRow(mapped, targetTable, i + 2)
      if (rowErrors.length > 0) {
        errors.push(...rowErrors.map(e => `Row ${e.row}: ${e.field} – ${e.message}`))
        skippedRows++
        continue
      }

      if (dryRun) {
        // Dry-run: just count what would happen without writing
        const keyValue = upsertKey ? mapped[upsertKey] : null
        const exists   = keyValue ? await checkExists(tenantId, targetTable, upsertKey!, keyValue) : false
        exists ? updatedRows++ : createdRows++
        continue
      }

      try {
        if (targetTable === "trader_products") {
          const existing = upsertKey && mapped[upsertKey]
            ? await findProductByKey(tenantId, upsertKey, mapped[upsertKey])
            : null

          if (existing) {
            await productRepository.update(tenantId, existing.id, {
              code:        mapped.code        || existing.code,
              name:        mapped.name        || existing.name,
              description: mapped.description || existing.description,
              unit:        mapped.unit        || existing.unit,
              category:    mapped.category    || existing.category,
            })
            const sellPrice = mapped.sell_price ? parseFloat(mapped.sell_price) : undefined
            const costPrice = mapped.cost_price ? parseFloat(mapped.cost_price) : undefined
            if (sellPrice !== undefined || costPrice !== undefined) {
              await productRepository.upsertPrice(tenantId, existing.id, costPrice ?? 0, sellPrice ?? 0)
            }
            if (mapped.qty_on_hand) {
              await productRepository.upsertInventory(tenantId, existing.id, parseFloat(mapped.qty_on_hand) || 0)
            }
            updatedRows++
          } else {
            const product = await productRepository.create({
              tenantId,
              code:        mapped.code        || null,
              name:        mapped.name,
              description: mapped.description || null,
              unit:        mapped.unit        || "pcs",
              category:    mapped.category    || null,
              isActive:    true,
            })
            const sellPrice = mapped.sell_price ? parseFloat(mapped.sell_price) : undefined
            const costPrice = mapped.cost_price ? parseFloat(mapped.cost_price) : undefined
            if (sellPrice !== undefined || costPrice !== undefined) {
              await productRepository.upsertPrice(tenantId, product.id, costPrice ?? 0, sellPrice ?? 0)
            }
            if (mapped.qty_on_hand) {
              await productRepository.upsertInventory(tenantId, product.id, parseFloat(mapped.qty_on_hand) || 0)
            }
            createdRows++
          }
        } else if (targetTable === "customers") {
          const existing = upsertKey && mapped[upsertKey]
            ? await findCustomerByKey(tenantId, upsertKey, mapped[upsertKey])
            : null

          if (existing) {
            await customerRepository.update(tenantId, existing.id, {
              code:          mapped.code           || existing.code,
              name:          mapped.name           || existing.name,
              taxId:         mapped.tax_id         || existing.taxId,
              address:       mapped.address        || existing.address,
              phone:         mapped.phone          || existing.phone,
              email:         mapped.email          || existing.email,
              contactPerson: mapped.contact_person || existing.contactPerson,
            })
            updatedRows++
          } else {
            await customerRepository.create({
              tenantId,
              code:          mapped.code           || null,
              name:          mapped.name,
              taxId:         mapped.tax_id         || null,
              address:       mapped.address        || null,
              phone:         mapped.phone          || null,
              email:         mapped.email          || null,
              contactPerson: mapped.contact_person || null,
              notes:         null,
              isActive:      true,
            })
            createdRows++
          }
        } else if (targetTable === "suppliers") {
          const existing = upsertKey && mapped[upsertKey]
            ? await findSupplierByKey(tenantId, upsertKey, mapped[upsertKey])
            : null

          if (existing) {
            await supplierRepository.update(tenantId, existing.id, {
              code:          mapped.code           || existing.code,
              name:          mapped.name           || existing.name,
              taxId:         mapped.tax_id         || existing.taxId,
              address:       mapped.address        || existing.address,
              phone:         mapped.phone          || existing.phone,
              email:         mapped.email          || existing.email,
              contactPerson: mapped.contact_person || existing.contactPerson,
            })
            updatedRows++
          } else {
            await supplierRepository.create({
              tenantId,
              code:          mapped.code           || null,
              name:          mapped.name,
              taxId:         mapped.tax_id         || null,
              address:       mapped.address        || null,
              phone:         mapped.phone          || null,
              email:         mapped.email          || null,
              contactPerson: mapped.contact_person || null,
              notes:         null,
              isActive:      true,
            })
            createdRows++
          }
        }
      } catch (err) {
        errors.push(`Row ${i + 2}: ${String(err)}`)
        skippedRows++
      }
    }

    const successRows = createdRows + updatedRows

    if (!dryRun) {
      await db.insert(importLogs).values({
        id:          randomUUID(),
        tenantId,
        fileName,
        totalRows:   sheet.rows.length,
        successRows,
        failedRows:  skippedRows + errors.length,
        errors:      errors.length ? errors : null,
      })
    }

    return {
      totalRows:   sheet.rows.length,
      createdRows,
      updatedRows,
      skippedRows,
      errors,
      dryRun:      Boolean(dryRun),
    }
  },
}

async function findProductByKey(tenantId: number, key: string, value: string) {
  const all = await productRepository.findMany(tenantId)
  return all.find(p => {
    if (key === "code") return p.code === value
    if (key === "name") return p.name === value
    return false
  }) ?? null
}

async function findCustomerByKey(tenantId: number, key: string, value: string) {
  const all = await customerRepository.findMany(tenantId)
  return all.find(c => {
    if (key === "code")   return c.code === value
    if (key === "name")   return c.name === value
    if (key === "tax_id") return c.taxId === value
    return false
  }) ?? null
}

async function findSupplierByKey(tenantId: number, key: string, value: string) {
  const all = await supplierRepository.findMany(tenantId)
  return all.find(s => {
    if (key === "code")   return s.code === value
    if (key === "name")   return s.name === value
    if (key === "tax_id") return s.taxId === value
    return false
  }) ?? null
}

async function checkExists(tenantId: number, targetTable: TargetTable, key: string, value: string) {
  if (targetTable === "trader_products") return !!(await findProductByKey(tenantId, key, value))
  if (targetTable === "customers")       return !!(await findCustomerByKey(tenantId, key, value))
  if (targetTable === "suppliers")       return !!(await findSupplierByKey(tenantId, key, value))
  return false
}

function normalizeForMatch(s: string): string {
  return s.toLowerCase().replace(/\.[^.]+$/, "").replace(/[\s_\-]+/g, " ").trim()
}

function findMatchingTemplate(
  templates: { id: number; name: string; columnMapping: Record<string, string> }[],
  fileName:  string,
  headers:   string[],
) {
  const normFile = normalizeForMatch(fileName)

  // 1. Match by filename substring
  for (const tpl of templates) {
    const normName = normalizeForMatch(tpl.name)
    if (normFile.includes(normName) || normName.includes(normFile)) return tpl
  }

  // 2. Match by exact column headers overlap (>= 70% of mapped columns present)
  for (const tpl of templates) {
    const mappedHeaders = Object.keys(tpl.columnMapping)
    if (mappedHeaders.length === 0) continue
    const matched = mappedHeaders.filter(h => headers.includes(h)).length
    if (matched / mappedHeaders.length >= 0.7) return tpl
  }

  return null
}
