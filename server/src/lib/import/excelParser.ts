import ExcelJS from "exceljs"

export interface ParsedSheet {
  sheetName: string
  headers:   string[]
  rows:      Record<string, string>[]
}

export async function parseExcelBuffer(buffer: Buffer): Promise<ParsedSheet[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const sheets: ParsedSheet[] = []

  workbook.eachSheet(sheet => {
    const headerRow = sheet.getRow(1)
    const headers: string[] = []
    headerRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
      headers[colNum - 1] = String(cell.value ?? "").trim()
    })
    // Drop trailing empty columns
    while (headers.length > 0 && !headers[headers.length - 1]) headers.pop()
    if (headers.length === 0) return

    const rows: Record<string, string>[] = []
    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return
      const record: Record<string, string> = {}
      let hasValue = false
      headers.forEach((header, i) => {
        if (!header) return
        const val = String(row.getCell(i + 1).value ?? "").trim()
        record[header] = val
        if (val) hasValue = true
      })
      if (hasValue) rows.push(record)
    })
    if (rows.length > 0) sheets.push({ sheetName: sheet.name, headers, rows })
  })

  return sheets
}
