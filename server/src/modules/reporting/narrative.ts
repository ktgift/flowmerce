// Stub — AI narrative generation (Gemini) is wired here when ready.
// Returns a plain text executive brief without calling any AI API.

export const narrativeService = {
  async executiveBrief(_data: {
    period:         string
    summary:        Record<string, any>
    kpiComparison:  Record<string, any>
    topCustomers:   any[]
    pipeline:       any[]
  }): Promise<string> {
    const { period, summary } = _data
    return (
      `รายงานสรุปยอดขาย ${period}: ` +
      `รายได้รวม ${summary.totalRevenue?.toLocaleString()} บาท ` +
      `(Win rate ${summary.winRate}%)`
    )
  },
}
