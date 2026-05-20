import ExcelJS from "exceljs"
import type { ParsedSection } from "./index"

export async function parseExcel(filePath: string): Promise<ParsedSection[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const sections: ParsedSection[] = []

  workbook.eachSheet(sheet => {
    const headerRow = sheet.getRow(1)
    const headers: string[] = []
    headerRow.eachCell(cell => headers.push(String(cell.value ?? "")))

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values: string[] = []
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1] ?? `col${colNumber}`
        const value  = String(cell.value ?? "").trim()
        if (value) values.push(`${header}: ${value}`)
      })
      if (values.length === 0) return
      sections.push({
        content:   values.join(" | "),
        sheetName: sheet.name,
        rowStart:  rowNumber,
        rowEnd:    rowNumber,
      })
    })
  })
  return sections
}