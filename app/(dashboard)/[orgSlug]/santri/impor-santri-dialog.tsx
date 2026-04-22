'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FileSpreadsheet, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { importSantriBatch } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ImporSantriDialog({ orgId, orgSlug }: { orgId: string, orgSlug: string }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [results, setResults] = useState<{ success: number, failed: any[] }>({ success: 0, failed: [] })
  
  const router = useRouter()

  const resetState = () => {
    setFile(null)
    setLoading(false)
    setProgress(0)
    setStatus('idle')
    setResults({ success: 0, failed: [] })
  }

  const generateTemplate = () => {
    const headers = [
      ['NIS', 'Nama Lengkap', 'Jenis Kelamin (L/P)', 'Kelas', 'Kamar', 'Tahun Masuk'],
      ['12345', 'Ahmad Santri', 'L', '7A', 'Zaid bin Tsabit', '2024'],
      ['12346', 'Siti Fatimah', 'P', '8B', 'Aisyah 1', '2023'],
    ]
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(headers)
    XLSX.utils.book_append_sheet(wb, ws, 'Template Impor Santri')
    XLSX.writeFile(wb, 'template_impor_santri.xlsx')
  }

  const convertGender = (val: string) => {
    if (!val) return 'male'
    const lower = val.toString().toLowerCase().trim()
    if (['l', 'laki', 'laki-laki', 'male', 'man', 'ikhwan'].includes(lower)) return 'male'
    if (['p', 'perempuan', 'female', 'woman', 'akhwat'].includes(lower)) return 'female'
    return 'male'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const processImport = async () => {
    if (!file) return

    setLoading(true)
    setStatus('processing')
    setProgress(0)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet)

        if (jsonData.length === 0) {
          toast.error('File kosong atau format tidak sesuai')
          setLoading(false)
          setStatus('idle')
          return
        }

        const totalRecords = jsonData.length
        const mappedData = jsonData.map(row => ({
          nis: row['NIS'],
          full_name: row['Nama Lengkap'],
          gender: convertGender(row['Jenis Kelamin (L/P)']),
          kelas: row['Kelas'],
          kamar: row['Kamar'],
          tahun_masuk: row['Tahun Masuk'],
          original_row: row // Keep for error report
        }))

        // Chunking
        const chunkSize = 50
        const totalChunks = Math.ceil(mappedData.length / chunkSize)
        let successCount = 0
        const failedRecords: any[] = []

        for (let i = 0; i < totalChunks; i++) {
          const chunk = mappedData.slice(i * chunkSize, (i + 1) * chunkSize)
          const apiResults = await importSantriBatch(orgId, chunk)

          apiResults.forEach((res: any) => {
            if (res.success) {
              successCount++
            } else {
              failedRecords.push({
                ...res.data.original_row,
                'Alasan Gagal': res.reason
              })
            }
          })

          setProgress(Math.round(((i + 1) / totalChunks) * 100))
        }

        setResults({ success: successCount, failed: failedRecords })
        setStatus('done')
        setLoading(false)
        router.refresh()
        toast.success(`Import selesai: ${successCount} berhasil, ${failedRecords.length} gagal.`)
      }
      reader.readAsBinaryString(file)
    } catch (error) {
      console.error(error)
      toast.error('Gagal memproses file')
      setLoading(false)
      setStatus('idle')
    }
  }

  const downloadErrorReport = () => {
    if (results.failed.length === 0) return
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(results.failed)
    XLSX.utils.book_append_sheet(wb, ws, 'Gagal Impor')
    XLSX.writeFile(wb, 'gagal_impor_santri.xlsx')
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Impor dari Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Impor Data Santri</DialogTitle>
          <DialogDescription>
            Unggah file Excel untuk menambahkan santri secara massal. Maksimal 1.000 baris.
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' && (
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 hover:bg-muted/50 transition-colors cursor-pointer relative">
               <Upload className="h-10 w-10 text-muted-foreground mb-2" />
               <p className="text-sm font-medium">Klik atau geser file ke sini</p>
               <p className="text-xs text-muted-foreground mt-1">Hanya file .xlsx atau .xls</p>
               <input 
                 type="file" 
                 accept=".xlsx, .xls" 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={handleFileChange}
               />
               {file && (
                 <div className="mt-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                   {file.name}
                 </div>
               )}
            </div>
            
            <div className="flex flex-col gap-2">
               <p className="text-xs text-muted-foreground font-medium">Instruksi:</p>
               <ol className="text-xs text-muted-foreground list-decimal ml-4 space-y-1">
                 <li>Unduh template Excel yang sudah disediakan.</li>
                 <li>Isi data santri sesuai dengan format kolom.</li>
                 <li>Kolom Jenis Kelamin mendukung input: L, P, Laki-laki, Perempuan.</li>
                 <li>Simpan dan unggah kembali di sini.</li>
               </ol>
               <Button variant="ghost" size="sm" className="w-fit h-auto p-0 text-primary mt-2 group" onClick={generateTemplate}>
                 <Download className="mr-1.5 h-3.5 w-3.5 group-hover:animate-bounce" />
                 Unduh Template Excel
               </Button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden relative">
               <div 
                 className="bg-primary h-full transition-all duration-300 ease-in-out" 
                 style={{ width: `${progress}%` }}
               />
            </div>
            <p className="text-sm font-medium animate-pulse">Memproses data... {progress}%</p>
            <p className="text-xs text-muted-foreground mt-1">Jangan menutup jendela ini halaman hingga selesai.</p>
          </div>
        )}

        {status === 'done' && (
          <div className="py-6 flex flex-col items-center text-center">
             <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
             </div>
             <h3 className="text-lg font-bold">Proses Selesai</h3>
             <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="bg-muted p-4 rounded-lg">
                   <p className="text-2xl font-bold text-green-600">{results.success}</p>
                   <p className="text-xs text-muted-foreground">Berhasil diimpor</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                   <p className="text-2xl font-bold text-red-600">{results.failed.length}</p>
                   <p className="text-xs text-muted-foreground">Gagal (error)</p>
                </div>
             </div>

             {results.failed.length > 0 && (
               <div className="mt-8 w-full p-4 border border-red-100 bg-red-50/50 rounded-lg flex items-start gap-3 text-left">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Ditemukan baris bermasalah</p>
                    <p className="text-xs text-red-700/80 mt-1 mb-3">Silakan unduh laporan error untuk melihat alasan detail kegagalan insert.</p>
                    <Button variant="destructive" size="sm" onClick={downloadErrorReport}>
                      <Download className="mr-2 h-4 w-4" />
                      Unduh Laporan Error
                    </Button>
                  </div>
               </div>
             )}
          </div>
        )}

        <DialogFooter>
          {status === 'idle' ? (
            <Button onClick={processImport} disabled={!file || loading}>
               Mulai Impor
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
               Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
