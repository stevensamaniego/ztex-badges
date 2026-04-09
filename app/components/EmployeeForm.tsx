'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './Toast'
import Image from 'next/image'

interface EmployeeFormProps {
  initialData?: {
    id: string
    employeeId: string | null
    fullName: string
    title: string
    authorizations: string[]
    licenses: string[]
  }
}

export function EmployeeForm({ initialData }: EmployeeFormProps) {
  const router = useRouter()
  const { showToast, ToastElement } = useToast()
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [title, setTitle] = useState(initialData?.title || '')
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || '')
  const [authorizations, setAuthorizations] = useState<string[]>(initialData?.authorizations || [''])
  const [licenses, setLicenses] = useState<string[]>(initialData?.licenses || [''])

  const addItem = (list: string[], setList: (v: string[]) => void) => {
    setList([...list, ''])
  }

  const removeItem = (list: string[], setList: (v: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index))
  }

  const updateItem = (list: string[], setList: (v: string[]) => void, index: number, value: string) => {
    const updated = [...list]
    updated[index] = value
    setList(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const body = {
      fullName,
      title,
      employeeId: employeeId || null,
      authorizations: authorizations.filter(Boolean),
      licenses: licenses.filter(Boolean),
    }

    const url = initialData ? `/api/employees/${initialData.id}` : '/api/employees'
    const method = initialData ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)

    if (res.ok) {
      showToast(initialData ? 'Employee updated' : 'Employee created', 'success')
      setTimeout(() => router.push('/admin'), 500)
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to save', 'error')
    }
  }

  // Preview data
  const previewAuths = authorizations.filter(Boolean)
  const previewLics = licenses.filter(Boolean)
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {ToastElement}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-6">
            {initialData ? 'Edit Employee' : 'Add New Employee'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-ztex-dark rounded-xl p-6 border border-white/5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Employee ID (optional)</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-ztex-black border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-ztex-red focus:ring-1 focus:ring-ztex-red transition-colors text-sm"
                  placeholder="e.g., EMP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-ztex-black border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-ztex-red focus:ring-1 focus:ring-ztex-red transition-colors text-sm"
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Title / Position *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-ztex-black border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-ztex-red focus:ring-1 focus:ring-ztex-red transition-colors text-sm"
                  placeholder="e.g., Project Manager"
                  required
                />
              </div>
            </div>

            {/* Authorizations */}
            <div className="bg-ztex-dark rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-white/70">Authorizations</label>
                <button
                  type="button"
                  onClick={() => addItem(authorizations, setAuthorizations)}
                  className="text-xs text-ztex-red hover:text-white transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {authorizations.map((auth, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={auth}
                      onChange={(e) => updateItem(authorizations, setAuthorizations, i, e.target.value)}
                      className="flex-1 bg-ztex-black border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-ztex-red focus:ring-1 focus:ring-ztex-red transition-colors text-sm"
                      placeholder="e.g., Heavy Equipment Operation"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(authorizations, setAuthorizations, i)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Licenses */}
            <div className="bg-ztex-dark rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-white/70">Licenses &amp; Certifications</label>
                <button
                  type="button"
                  onClick={() => addItem(licenses, setLicenses)}
                  className="text-xs text-ztex-red hover:text-white transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {licenses.map((lic, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={lic}
                      onChange={(e) => updateItem(licenses, setLicenses, i, e.target.value)}
                      className="flex-1 bg-ztex-black border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-ztex-red focus:ring-1 focus:ring-ztex-red transition-colors text-sm"
                      placeholder="e.g., OSHA 30-Hour"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(licenses, setLicenses, i)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-ztex-red hover:bg-ztex-dark-red disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? 'Saving...' : initialData ? 'Update Employee' : 'Create Employee'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="bg-white/5 hover:bg-white/10 text-white/70 font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Public Page Preview</h2>
          <div className="bg-ztex-black rounded-xl p-4 border border-white/5">
            <div className="bg-ztex-dark rounded-xl overflow-hidden shadow-lg border border-white/5 max-w-sm mx-auto">
              <div className="bg-gradient-to-r from-ztex-red to-ztex-dark-red p-4">
                <Image
                  src="/images/ztex-logo-white.png"
                  alt="ZTEX"
                  width={100}
                  height={30}
                  className="mx-auto mb-3"
                />
                <div className="text-center">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/20">
                    <span className="text-lg font-bold text-white">{initials || '??'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{fullName || 'Employee Name'}</h3>
                  <p className="text-white/80 text-sm">{title || 'Title'}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {previewAuths.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-ztex-red uppercase tracking-wider mb-1.5">Authorizations</h4>
                    <ul className="space-y-1">
                      {previewAuths.map((a, i) => (
                        <li key={i} className="text-xs text-ztex-light bg-white/5 rounded px-2 py-1.5 flex items-center gap-2">
                          <span className="text-ztex-red">&#10003;</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewLics.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-ztex-red uppercase tracking-wider mb-1.5">Licenses</h4>
                    <ul className="space-y-1">
                      {previewLics.map((l, i) => (
                        <li key={i} className="text-xs text-ztex-light bg-white/5 rounded px-2 py-1.5 flex items-center gap-2">
                          <span className="text-ztex-red">&#9670;</span> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
