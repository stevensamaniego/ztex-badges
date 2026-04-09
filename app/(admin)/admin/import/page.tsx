'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { AdminNav } from '@/app/components/AdminNav'
import { useToast } from '@/app/components/Toast'

export default function ImportPage() {
  const { status } = useSession()
  const router = useRouter()
  const { showToast, ToastElement } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ newCount: number; updateCount: number; unchangedCount: number; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(null)
    }
  }

  const handlePreview = async () => {
    if (!file) return
    setPreviewing(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('preview', 'true')

    const res = await fetch('/api/employees/import', { method: 'POST', body: formData })
    if (res.ok) {
      setPreview(await res.json())
    } else {
      showToast('Failed to preview file', 'error')
    }
    setPreviewing(false)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('preview', 'false')

    const res = await fetch('/api/employees/import', { method: 'POST', body: formData })
    if (res.ok) {
      const result = await res.json()
      showToast(`Import complete: ${result.newCount} new, ${result.updateCount} updated`, 'success')
      setFile(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } else {
      showToast('Import failed', 'error')
    }
    setImporting(false)
  }

  const downloadTemplate = () => {
    const csv = 'employee_id,full_name,title,authorizations,licenses\nEMP-001,John Smith,Project Manager,Heavy Equipment Operation;Confined Space Entry,OSHA 30-Hour;First Aid/CPR\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ztex-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-ztex-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ztex-black">
      {ToastElement}
      <AdminNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Bulk Import</h1>
        <p className="text-white/50 text-sm mb-8">Upload a CSV or Excel file to import employees in bulk.</p>

        <div className="bg-ztex-dark rounded-xl p-6 border border-white/5 space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Download Template</p>
              <p className="text-xs text-white/50 mt-0.5">CSV with expected columns and example data</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="text-sm text-ztex-red hover:text-white transition-colors font-medium"
            >
              Download CSV
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Upload File</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-ztex-red file:text-white hover:file:bg-ztex-dark-red file:cursor-pointer file:transition-colors"
            />
          </div>

          {/* Expected Format */}
          <div className="text-xs text-white/40 space-y-1">
            <p className="font-medium text-white/60">Expected columns:</p>
            <p><span className="text-white/50">employee_id</span> — optional, used for matching existing records</p>
            <p><span className="text-white/50">full_name</span> — required</p>
            <p><span className="text-white/50">title</span> — required</p>
            <p><span className="text-white/50">authorizations</span> — semicolon-separated list</p>
            <p><span className="text-white/50">licenses</span> — semicolon-separated list</p>
          </div>

          {/* Actions */}
          {file && (
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                disabled={previewing}
                className="bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                {previewing ? 'Analyzing...' : 'Preview Changes'}
              </button>
              {preview && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-ztex-red hover:bg-ztex-dark-red disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {importing ? 'Importing...' : 'Apply Import'}
                </button>
              )}
            </div>
          )}

          {/* Preview Results */}
          {preview && (
            <div className="bg-ztex-black rounded-lg p-4 border border-white/5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Import Preview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{preview.newCount}</div>
                  <div className="text-xs text-white/50">New</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{preview.updateCount}</div>
                  <div className="text-xs text-white/50">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white/30">{preview.unchangedCount}</div>
                  <div className="text-xs text-white/50">Unchanged</div>
                </div>
              </div>
              {preview.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {preview.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
