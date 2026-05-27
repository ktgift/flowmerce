import puppeteer               from "puppeteer"
import { db }                  from "../../db"
import { eq }                  from "drizzle-orm"
import { purchaseOrders }      from "../../db/schema/core"
import { tenants }             from "../../db/schema/core"
import { poRepository }        from "./repository"
import { supplierRepository }  from "../suppliers/repository"
import { Errors }              from "../../lib/errors"
import type { PoFull, PoItemRow } from "../../types/po"
import type { SupplierRecord }  from "../suppliers/model"

// ── helpers ──────────────────────────────────────────────────────

function fmt(n: number | null | undefined, decimals = 2): string {
  const v = n ?? 0
  return v.toLocaleString("th-TH", {
    minimumFractionDigits:  decimals,
    maximumFractionDigits:  decimals,
  })
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "-"
  const dt = new Date(d)
  return dt.toLocaleDateString("th-TH", {
    year: "numeric", month: "2-digit", day: "2-digit",
  })
}

const ONES  = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"]
const TENS  = ["", "สิบ", "ยี่สิบ", "สามสิบ", "สี่สิบ", "ห้าสิบ", "หกสิบ", "เจ็ดสิบ", "แปดสิบ", "เก้าสิบ"]
const UNITS = ["", "หมื่น", "แสน", "ล้าน"]

function threeDigitsToThai(n: number): string {
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const o = n % 10
  let s = ""
  if (h > 0) s += ONES[h] + "ร้อย"
  if (t > 0) s += TENS[t]
  if (o > 0) {
    if (t === 1 && o === 1) s += "เอ็ด"
    else s += ONES[o]
  }
  return s
}

function bahtText(amount: number): string {
  if (amount === 0) return "ศูนย์บาทถ้วน"

  const isNeg = amount < 0
  const abs   = Math.abs(Math.round(amount * 100))
  const baht  = Math.floor(abs / 100)
  const stn   = abs % 100

  const chunks: number[] = []
  let rem = baht
  while (rem > 0) { chunks.unshift(rem % 1000); rem = Math.floor(rem / 1000) }

  let text = isNeg ? "ลบ" : ""
  chunks.forEach((c, i) => {
    if (c === 0) return
    const suffix = chunks.length - 1 - i
    text += threeDigitsToThai(c)
    if (suffix > 0) text += ["พัน", "หมื่น", "แสน", "ล้าน", "พันล้าน", "หมื่นล้าน"][suffix - 1] ?? ""
  })

  text += "บาท"
  if (stn === 0) {
    text += "ถ้วน"
  } else {
    const st = Math.floor(stn / 10)
    const su = stn % 10
    if (st > 0) text += TENS[st]
    if (su > 0) text += ONES[su]
    text += "สตางค์"
  }
  return text
}

// ── main service ─────────────────────────────────────────────────

export const poExportService = {
  async exportPdf(tenantId: number, id: number, exportedBy?: string | null): Promise<Buffer> {
    const po = await poRepository.findFull(tenantId, id)
    if (!po) throw Errors.PO_NOT_FOUND()

    const [supplier, tenant] = await Promise.all([
      po.supplierId ? supplierRepository.findOne(tenantId, po.supplierId) : null,
      db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) }),
    ])

    const html    = buildHtml(po, supplier, tenant?.name ?? "Flowmerce")
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
    const page    = await browser.newPage()
    await page.setContent(html, { waitUntil: "load" })
    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin:          { top: "10mm", bottom: "10mm", left: "12mm", right: "12mm" },
    })
    await browser.close()

    poRepository.addHistory(tenantId, {
      purchaseOrderId: id,
      action:          "pdf_exported",
      oldStatus:       null,
      newStatus:       null,
      changedBy:       exportedBy ?? null,
    }).catch(() => {})

    return Buffer.from(pdf)
  },
}

// ── HTML builder ─────────────────────────────────────────────────

function itemRows(items: PoItemRow[], currency: string): string {
  if (items.length === 0) {
    return `<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:24px 0">— ไม่มีรายการ —</td></tr>`
  }
  return items.map((item, i) => {
    const unitPrice = item.exWorkPrice ?? 0
    const amount    = item.lineTotalThb ?? 0
    return `
    <tr>
      <td class="td-center">${i + 1}</td>
      <td>
        <div class="item-name">${item.name}</div>
        ${item.sku ? `<div class="item-sub">SKU: ${item.sku}</div>` : ""}
      </td>
      <td class="td-center">${fmt(item.quantity, 2)}</td>
      <td class="td-right">${fmt(unitPrice, 2)} <span class="currency">${currency}</span></td>
      <td class="td-center">—</td>
      <td class="td-right bold">${fmt(amount, 2)}</td>
    </tr>`
  }).join("")
}

function buildHtml(po: PoFull, supplier: SupplierRecord | null, companyName: string): string {
  const subtotalThb     = po.subtotalThb     ?? 0
  const totalLandedCost = po.totalLandedCost ?? subtotalThb
  const landingExtra    = totalLandedCost - subtotalThb

  const rows        = itemRows(po.items, po.currency ?? "USD")
  const amountWords = bahtText(totalLandedCost)

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Sarabun', 'Tahoma', sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 100%;
    max-width: 794px;
    margin: 0 auto;
    padding: 0;
  }

  /* ── Top header ── */
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 0 10px;
    border-bottom: 2px solid #111;
    margin-bottom: 8px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .brand-logo {
    width: 48px;
    height: 48px;
    background: #111;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: -0.5px;
    text-align: center;
    line-height: 1.2;
    padding: 4px;
  }
  .brand-name {
    font-weight: 800;
    font-size: 22px;
    letter-spacing: -0.5px;
    color: #111;
  }
  .brand-name span {
    color: #2563eb;
  }
  .company-addr {
    text-align: right;
    font-size: 10px;
    color: #444;
    line-height: 1.5;
    max-width: 280px;
  }

  /* ── PO Title block ── */
  .title-block {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
  .title-box {
    border: 1.5px solid #111;
    min-width: 240px;
  }
  .title-box-header {
    background: #111;
    color: #fff;
    text-align: center;
    padding: 6px 20px;
  }
  .title-box-header .en { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
  .title-box-header .th { font-size: 11px; font-weight: 600; color: #ccc; }
  .title-box-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 10px;
    border-top: 1px solid #ddd;
    font-size: 10px;
    color: #555;
  }
  .title-box-num {
    background: #f8f8f8;
    border-top: 1.5px solid #111;
    padding: 6px 10px;
    text-align: right;
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 1px;
  }

  /* ── Info section ── */
  .info-row {
    display: flex;
    gap: 0;
    border: 1px solid #bbb;
    margin-bottom: 8px;
  }
  .info-col {
    flex: 1;
    padding: 8px 10px;
    border-right: 1px solid #bbb;
  }
  .info-col:last-child { border-right: none; }
  .info-field {
    display: flex;
    gap: 4px;
    margin-bottom: 4px;
    align-items: flex-start;
  }
  .info-label {
    color: #555;
    font-size: 10px;
    min-width: 90px;
    line-height: 1.6;
    white-space: nowrap;
  }
  .info-label-en {
    color: #888;
    font-size: 9px;
    display: block;
    line-height: 1.2;
  }
  .info-value {
    font-weight: 600;
    font-size: 11px;
    line-height: 1.6;
  }

  /* ── Items table ── */
  table.items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }
  table.items thead tr {
    background: #111;
    color: #fff;
  }
  table.items th {
    padding: 7px 8px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid #555;
  }
  table.items td {
    padding: 6px 8px;
    border: 1px solid #ccc;
    font-size: 11px;
    vertical-align: top;
  }
  table.items tbody tr:nth-child(even) td {
    background: #f9fafb;
  }
  table.items .td-center { text-align: center; }
  table.items .td-right  { text-align: right; }
  .item-name { font-weight: 600; }
  .item-sub  { font-size: 10px; color: #777; margin-top: 1px; }
  .currency  { font-size: 9px; color: #888; }
  .bold      { font-weight: 700; }

  /* Empty rows to pad the table */
  .item-empty td { height: 22px; border: 1px solid #ccc; }

  /* ── Summary section ── */
  .summary-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border: 1px solid #bbb;
    border-top: none;
    padding: 10px;
    gap: 16px;
  }
  .amount-text {
    flex: 1;
    font-size: 11px;
  }
  .amount-text-label {
    font-size: 10px;
    color: #777;
    margin-bottom: 2px;
  }
  .amount-text-value {
    font-weight: 700;
    color: #111;
    font-size: 12px;
  }
  table.summary {
    width: 260px;
    border-collapse: collapse;
  }
  table.summary td {
    padding: 3px 8px;
    font-size: 11px;
    border: 1px solid #ccc;
  }
  table.summary .sum-label  { color: #444; }
  table.summary .sum-en     { font-size: 9px; color: #888; display: block; }
  table.summary .sum-value  { text-align: right; font-weight: 600; min-width: 90px; }
  table.summary .total-row td {
    background: #111;
    color: #fff;
    font-weight: 800;
    font-size: 13px;
    border-color: #111;
  }

  /* ── Signature area ── */
  .sig-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border: 1px solid #bbb;
    border-top: none;
    padding: 14px 24px 10px;
    gap: 8px;
  }
  .sig-block {
    text-align: center;
    flex: 1;
  }
  .sig-line {
    width: 80%;
    border-bottom: 1.5px solid #444;
    margin: 0 auto 4px;
    height: 36px;
  }
  .sig-stamp {
    width: 90px;
    height: 90px;
    border: 2px dashed #bbb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: #ccc;
    font-size: 10px;
    text-align: center;
    line-height: 1.4;
  }
  .sig-label { font-size: 10.5px; font-weight: 600; color: #333; }
  .sig-sub   { font-size: 9px; color: #888; }
  .sig-date  { font-size: 10px; color: #555; margin-top: 3px; }

  /* ── Footer ── */
  .doc-footer {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 4px;
    text-align: center;
    font-size: 9px;
    color: #888;
  }
</style>
</head>
<body>
<div class="page">

  <!-- ── Top header ── -->
  <div class="top-header">
    <div class="brand">
      <div class="brand-logo">FLOW<br>MERCE</div>
      <div class="brand-name">${companyName.toUpperCase().replace(/ /g, "&nbsp;")}</div>
    </div>
    <div class="company-addr">
      ${companyName}<br>
      <span style="color:#888">Purchasing Department</span><br>
      เลขผู้เสียภาษี: —
    </div>
  </div>

  <!-- ── PO Title block ── -->
  <div class="title-block">
    <div class="title-box">
      <div class="title-box-header">
        <div class="en">Purchase Order</div>
        <div class="th">ใบสั่งซื้อ</div>
      </div>
      <div class="title-box-meta">
        <span>ต้นฉบับ / Original</span>
        <span style="color:#999">วันที่ / Date: ${fmtDate(po.issuedDate ?? po.createdAt)}</span>
      </div>
      <div class="title-box-num">${po.poNumber}</div>
    </div>
  </div>

  <!-- ── Info section ── -->
  <div class="info-row">
    <div class="info-col" style="flex:1.3">
      <div class="info-field">
        <div class="info-label">
          ผู้ขาย
          <span class="info-label-en">Supplier</span>
        </div>
        <div class="info-value">${supplier?.name ?? "—"}</div>
      </div>
      <div class="info-field">
        <div class="info-label">
          เลขผู้เสียภาษี
          <span class="info-label-en">Tax ID</span>
        </div>
        <div class="info-value">${supplier?.taxId ?? "—"}</div>
      </div>
      <div class="info-field">
        <div class="info-label">
          ที่อยู่
          <span class="info-label-en">Address</span>
        </div>
        <div class="info-value">${supplier?.address ?? "—"}</div>
      </div>
    </div>
    <div class="info-col">
      <div class="info-field">
        <div class="info-label">
          วันที่
          <span class="info-label-en">Issue Date</span>
        </div>
        <div class="info-value">${fmtDate(po.issuedDate ?? po.createdAt)}</div>
      </div>
      <div class="info-field">
        <div class="info-label">
          ผู้จัดทำ
          <span class="info-label-en">Prepared By</span>
        </div>
        <div class="info-value">${po.createdBy ?? "—"}</div>
      </div>
      <div class="info-field">
        <div class="info-label">
          การชำระเงิน
          <span class="info-label-en">Credit Term</span>
        </div>
        <div class="info-value">${po.paymentTerm ?? "—"}</div>
      </div>
      <div class="info-field">
        <div class="info-label">
          ผู้ติดต่อ
          <span class="info-label-en">Contact Name</span>
        </div>
        <div class="info-value">${supplier?.contactPerson ?? "—"}</div>
      </div>
      <div class="info-field">
        <div class="info-label">
          กำหนดส่ง
          <span class="info-label-en">Expected Date</span>
        </div>
        <div class="info-value">${fmtDate(po.expectedDate)}</div>
      </div>
    </div>
  </div>

  <!-- ── Items table ── -->
  <table class="items">
    <thead>
      <tr>
        <th style="width:34px;text-align:center">เลขที่<br><span style="font-weight:400;font-size:9px">No.</span></th>
        <th style="text-align:left">รายการ<br><span style="font-weight:400;font-size:9px">Description</span></th>
        <th style="width:68px;text-align:center">จำนวน<br><span style="font-weight:400;font-size:9px">Quantity</span></th>
        <th style="width:100px;text-align:right">ราคา/หน่วย<br><span style="font-weight:400;font-size:9px">Unit Price</span></th>
        <th style="width:60px;text-align:center">ส่วนลด<br><span style="font-weight:400;font-size:9px">Discount</span></th>
        <th style="width:100px;text-align:right">จำนวนเงิน (THB)<br><span style="font-weight:400;font-size:9px">Amount</span></th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      ${Array.from({ length: Math.max(0, 5 - po.items.length) }).map(() =>
        `<tr class="item-empty">
          <td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>`
      ).join("")}
    </tbody>
  </table>

  <!-- ── Summary section ── -->
  <div class="summary-section">
    <div class="amount-text">
      <div class="amount-text-label">จำนวนเงิน / Amount</div>
      <div class="amount-text-value">${amountWords}</div>
      ${po.remark ? `<div style="margin-top:6px;font-size:10px;color:#555"><strong>หมายเหตุ:</strong> ${po.remark}</div>` : ""}
    </div>
    <table class="summary">
      <tr>
        <td class="sum-label">รวมเป็นเงิน<span class="sum-en">Subtotal</span></td>
        <td class="sum-value">${fmt(subtotalThb)}</td>
      </tr>
      ${landingExtra > 0 ? `
      <tr>
        <td class="sum-label">ค่าใช้จ่ายนำเข้า<span class="sum-en">Landing Cost</span></td>
        <td class="sum-value">${fmt(landingExtra)}</td>
      </tr>` : ""}
      <tr>
        <td class="sum-label">จำนวนภาษีมูลค่าเพิ่ม 7 %<span class="sum-en">Value Added Tax</span></td>
        <td class="sum-value">0.00</td>
      </tr>
      <tr class="total-row">
        <td class="sum-label">จำนวนเงินรวมทั้งสิ้น<span class="sum-en" style="color:#ccc">Total</span></td>
        <td class="sum-value">${fmt(totalLandedCost)}</td>
      </tr>
    </table>
  </div>

  <!-- ── Signature section ── -->
  <div class="sig-section">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">ผู้ตรวจสอบ / Approver</div>
      <div class="sig-date">วันที่ / Date .....................</div>
    </div>
    <div class="sig-block">
      <div class="sig-stamp">ตราบริษัท<br>Company<br>Stamp</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">
        ${po.approvedBy ? `<div style="text-align:center;padding-top:10px;font-weight:700;font-size:11px">${po.approvedBy}</div>` : ""}
      </div>
      <div class="sig-label">ผู้มีอำนาจลงนาม / Authorized Signature</div>
      <div class="sig-date">วันที่ / Date ${fmtDate(po.issuedDate ?? po.createdAt)}</div>
    </div>
  </div>

  <!-- ── Footer ── -->
  <div class="doc-footer">
    ${companyName} — สร้างโดยระบบ Flowmerce เมื่อ ${new Date().toLocaleString("th-TH")}
  </div>

</div>
</body>
</html>`
}
