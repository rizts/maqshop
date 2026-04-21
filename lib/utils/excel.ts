import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm')
  XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`)
}
