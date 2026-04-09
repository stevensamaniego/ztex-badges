'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { AdminNav } from '@/app/components/AdminNav'
import { useToast } from '@/app/components/Toast'

interface Employee {
  id: string
  fullName: string
  title: string
}

export default function QRCodesPage() {
  const { status } = useSession()
  const router = useRouter()
  const { showToast, ToastElement } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [qrPreviews, setQrPreviews] = useState<Record<string, string>>({})

  const fetchEmployees = useCallback(async () => {
    const res = await fetch('/api/employees')
    if (res.ok) setEmployees(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
    else if (status === 'authenticated') fetchEmployees()
  }, [status, router, fetchEmployees])

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const selectAll = () => {
    if (selected.size === employees.length) setSelected(new Set())
    else setSelected(new Set(employees.map((e) => e.id)))
  }

  const generatePreview = async (id: string) => {
    const res = await fetch(`/api/employees/qr?id=${id}&baseUrl=${encodeURIComponent(window.location.origin)}`)
    if (res.ok) {
      const data = await res.json()
      setQrPreviews((prev) => ({ ...prev, [id]: data.qr }))
    }
  }

  const downloadBulk = async () => {
    setGenerating(true)
    const ids = selected.size > 0 ? Array.from(selected).join(',') : ''
    const url = `/api/employees/qr?${ids ? `ids=${ids}` : ''}&baseUrl=${encodeURIComponent(window.location.origin)}`

    try {
      const res = await fetch(url)
      if (res.ok) {
        const blob = await res.blob()
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'ztex-qr-codes.zip'
        a.click()
        URL.revokeObjectURL(downloadUrl)
        showToast('QR codes downloaded', 'success')
      } else {
        showToast('Failed to generate QR codes', 'error')
      }
    } catch {
      showToast('Failed to generate QR codes', 'error')
    }
    setGenerating(false)
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">QR Code Management</h1>
            <p className="text-white/50 text-sm mt-1">Generate and download QR codes for employee badges</p>
          </div>
          <button
            onClick={downloadBulk}
            disabled={generating || employees.length === 0}
            className="bg-ztex-red hover:bg-ztex-dark-red disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {generating ? 'Generating...' : selected.size > 0 ? `Download Selected (${selected.size})` : 'Download All'}
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white/50 py-12">Loading...</div>
        ) : (
          <div className="bg-ztex-dark rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.size === employees.length && employees.length > 0}
                onChange={selectAll}
                className="rounded accent-ztex-red"
              />
              <span className="text-sm text-white/50">
                {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.has(emp.id)}
                    onChange={() => toggleSelect(emp.id)}
                    className="rounded accent-ztex-red"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{emp.fullName}</div>
                    <div className="text-xs text-white/40">{emp.title}</div>
                  </div>

                  {qrPreviews[emp.id] ? (
                    <div className="w-20 h-20 bg-white rounded p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrPreviews[emp.id]} alt={`QR for ${emp.fullName}`} className="w-full h-full" />
                    </div>
                  ) : (
                    <button
                      onClick={() => generatePreview(emp.id)}
                      className="text-xs text-ztex-red hover:text-white transition-colors"
                    >
                      Preview QR
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
