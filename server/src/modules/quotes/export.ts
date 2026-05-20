import puppeteer                  from "puppeteer"
import ExcelJS                    from "exceljs"
import { quotationRepository }    from "./repository"
import { supplierRepository }     from "../suppliers/repository"
import { Errors }                 from "../../lib/errors"
import type { QuotationWithItems } from "./model"

export const quoteExportService = {

  async exportPdf(tenantId: number, id: number): Promise<Buffer> {
    const quote = await quotationRepository.findOne(tenantId, id)
    if (!quote) throw Errors.QUOTE_NOT_FOUND()

    const supplier = quote.supplierId
      ? await supplierRepository.findOne(tenantId, quote.supplierId)
      : null

    const html = buildHtml(quote, supplier?.name ?? null)

    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
    const page    = await browser.newPage()
    await page.setContent(html, { waitUntil: "domcontentloaded" })
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" } })
    await browser.close()

    return Buffer.from(pdf)
  },

  async exportExcel(tenantId: number, id: number): Promise<Buffer> {
    const quote = await quotationRepository.findOne(tenantId, id)
    if (!quote) throw Errors.QUOTE_NOT_FOUND()

    const supplier = quote.supplierId
      ? await supplierRepository.findOne(tenantId, quote.supplierId)
      : null

    const wb   = new ExcelJS.Workbook()
    const ws   = wb.addWorksheet("Quotation")

    // ── Header info block ────────────────────────────────────
    ws.getCell("A1").value = "ใบเสนอราคา / QUOTATION"
    ws.getCell("A1").font  = { bold: true, size: 16 }
    ws.mergeCells("A1:G1")

    ws.getCell("A3").value = "เลขที่ / Quote No."
    ws.getCell("B3").value = quote.quoteNumber
    ws.getCell("A4").value = "วันที่ / Date"
    ws.getCell("B4").value = quote.createdAt?.slice(0, 10) ?? ""
    ws.getCell("A5").value = "วันหมดอายุ / Valid Until"
    ws.getCell("B5").value = quote.validUntil ?? ""
    ws.getCell("A6").value = "สถานะ / Status"
    ws.getCell("B6").value = quote.status

    ws.getCell("D3").value = "ลูกค้า / Customer"
    ws.getCell("E3").value = quote.customerName
    ws.getCell("D4").value = "บริษัท / Company"
    ws.getCell("E4").value = quote.customerCompany
    ws.getCell("D5").value = "โครงการ / Project"
    ws.getCell("E5").value = quote.projectName ?? ""

    if (supplier) {
      ws.getCell("D6").value = "ซัพพลายเออร์"
      ws.getCell("E6").value = supplier.name
    }

    // ── Items table ──────────────────────────────────────────
    const tableStart = 9
    const headers    = ["#", "ชื่อสินค้า", "รายละเอียด", "จำนวน", "หน่วย", "ราคา/หน่วย", "ส่วนลด %", "รวม"]
    const colWidths  = [5, 30, 30, 10, 10, 15, 12, 15]

    headers.forEach((h, i) => {
      const cell     = ws.getCell(tableStart, i + 1)
      cell.value     = h
      cell.font      = { bold: true }
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6E4F7" } }
      cell.alignment = { horizontal: "center" }
      cell.border    = { bottom: { style: "thin" } }
      ws.getColumn(i + 1).width = colWidths[i]
    })

    quote.items.forEach((item, idx) => {
      const row = tableStart + 1 + idx
      ws.getCell(row, 1).value = idx + 1
      ws.getCell(row, 2).value = item.productName
      ws.getCell(row, 3).value = item.description ?? ""
      ws.getCell(row, 4).value = item.qty
      ws.getCell(row, 5).value = item.unit
      ws.getCell(row, 6).value = item.unitPrice
      ws.getCell(row, 7).value = item.discountPct
      ws.getCell(row, 8).value = item.lineTotal
      ws.getCell(row, 6).numFmt = "#,##0.00"
      ws.getCell(row, 8).numFmt = "#,##0.00"
    })

    // ── Totals ───────────────────────────────────────────────
    const totalRow = tableStart + 1 + quote.items.length + 1
    ws.getCell(totalRow,     7).value = "Subtotal"
    ws.getCell(totalRow,     8).value = quote.subtotal
    ws.getCell(totalRow + 1, 7).value = `VAT ${(quote.vatRate * 100).toFixed(0)}%`
    ws.getCell(totalRow + 1, 8).value = quote.vatAmount
    ws.getCell(totalRow + 2, 7).value = "Total"
    ws.getCell(totalRow + 2, 8).value = quote.total

    for (let r = totalRow; r <= totalRow + 2; r++) {
      ws.getCell(r, 7).font    = { bold: true }
      ws.getCell(r, 8).numFmt  = "#,##0.00"
    }
    ws.getCell(totalRow + 2, 8).font = { bold: true }

    if (quote.notes) {
      ws.getCell(totalRow + 4, 1).value = `หมายเหตุ: ${quote.notes}`
    }

    const buf = await wb.xlsx.writeBuffer()
    return Buffer.from(buf)
  },
}

// ── HTML template for PDF ────────────────────────────────────────

function fmt(n: number) {
  return n?.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"
}

function buildHtml(quote: QuotationWithItems, supplierName: string | null): string {
  const itemRows = quote.items.map((item, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td><strong>${item.productName}</strong>${item.description ? `<br><small>${item.description}</small>` : ""}</td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:center">${item.unit}</td>
      <td style="text-align:right">${fmt(item.unitPrice)}</td>
      <td style="text-align:center">${item.discountPct > 0 ? `${item.discountPct}%` : "-"}</td>
      <td style="text-align:right"><strong>${fmt(item.lineTotal)}</strong></td>
    </tr>
  `).join("")

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Sarabun', 'Arial', sans-serif; font-size: 13px; color: #222; }
    h1 { font-size: 22px; color: #1a56a0; margin-bottom: 4px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #1a56a0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 20px; }
    .info-row { display: flex; gap: 8px; }
    .info-label { color: #666; min-width: 110px; }
    .info-value { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead tr { background: #1a56a0; color: white; }
    th { padding: 8px 6px; text-align: left; font-size: 12px; }
    td { padding: 6px; border-bottom: 1px solid #e5e7eb; font-size: 12px; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .totals { margin-left: auto; width: 260px; }
    .totals table td { border: none; padding: 4px 6px; }
    .totals .grand td { border-top: 2px solid #222; font-weight: bold; font-size: 14px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .status-draft     { background: #f3f4f6; color: #374151; }
    .status-sent      { background: #dbeafe; color: #1d4ed8; }
    .status-accepted  { background: #d1fae5; color: #065f46; }
    .status-rejected  { background: #fee2e2; color: #991b1b; }
    .status-cancelled { background: #f3f4f6; color: #6b7280; }
    .notes { margin-top: 16px; padding: 10px; background: #f9fafb; border-left: 3px solid #1a56a0; font-size: 12px; }
    .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; color: #9ca3af; font-size: 11px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ใบเสนอราคา</h1>
      <div style="color:#666">QUOTATION</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:bold">${quote.quoteNumber}</div>
      <div style="color:#666">วันที่: ${quote.createdAt?.slice(0, 10) ?? ""}</div>
      ${quote.validUntil ? `<div style="color:#666">หมดอายุ: ${quote.validUntil}</div>` : ""}
      <span class="badge status-${quote.status}">${quote.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="info-grid">
    <div>
      <div class="info-row"><span class="info-label">ลูกค้า:</span><span class="info-value">${quote.customerName}</span></div>
      <div class="info-row"><span class="info-label">บริษัท:</span><span class="info-value">${quote.customerCompany}</span></div>
      ${quote.projectName ? `<div class="info-row"><span class="info-label">โครงการ:</span><span class="info-value">${quote.projectName}</span></div>` : ""}
    </div>
    <div>
      <div class="info-row"><span class="info-label">สกุลเงิน:</span><span class="info-value">${quote.currency}</span></div>
      ${supplierName ? `<div class="info-row"><span class="info-label">ซัพพลายเออร์:</span><span class="info-value">${supplierName}</span></div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px;text-align:center">#</th>
        <th>สินค้า / รายการ</th>
        <th style="width:60px;text-align:center">จำนวน</th>
        <th style="width:55px;text-align:center">หน่วย</th>
        <th style="width:90px;text-align:right">ราคา/หน่วย</th>
        <th style="width:65px;text-align:center">ส่วนลด</th>
        <th style="width:90px;text-align:right">รวม</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">${fmt(quote.subtotal)} ${quote.currency}</td></tr>
      <tr><td>VAT ${(quote.vatRate * 100).toFixed(0)}%</td><td style="text-align:right">${fmt(quote.vatAmount)} ${quote.currency}</td></tr>
      <tr class="grand"><td>Total</td><td style="text-align:right">${fmt(quote.total)} ${quote.currency}</td></tr>
    </table>
  </div>

  ${quote.notes ? `<div class="notes"><strong>หมายเหตุ:</strong> ${quote.notes}</div>` : ""}

  <div class="footer">เอกสารนี้สร้างโดยระบบ Flowmerce — ${new Date().toLocaleString("th-TH")}</div>
</body>
</html>`
}
