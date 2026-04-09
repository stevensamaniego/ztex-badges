'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { AdminNav } from '@/app/components/AdminNav'
import { useToast } from '@/app/components/Toast'
import Link from 'next/link'

interface Employee {
  id: string
  employeeId: string | null
  fullName: string
  title: string
  authorizations: string
  licenses: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { showToast, ToastElement } = useToast()

  const fetchEmployees = useCallback(async (query = '') => {
    setLoading(true)
    const res = await fetch(`/api/employees?search=${encodeURIComponent(query)}`)
    if (res.ok) {
      setEmployees(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchEmployees()
    }
  }, [status, router, fetchEmployees])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'authenticated') fetchEmployees(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, status, fetchEmployees])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast(`${name} deleted`, 'success')
      fetchEmployees(search)
    } else {
      showToast('Failed to delete', 'error')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} employees?`)) return
    let deleted = 0
    for (const id of selected) {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (res.ok) deleted++
    }
    showToast(`${deleted} employees deleted`, 'success')
    setSelected(new Set())
    fetchEmployees(search)
  }

  const downloadQR = async (id: string, name: string) => {
    const res = await fetch(`/api/employees/qr?id=${id}&baseUrl=${encodeURIComponent(window.location.origin)}`)
    if (res.ok) {
      const data = await res.json()
      const link = document.createElement('a')
      link.href = data.qr
      link.download = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_QR.png`
      link.click()
      showToast('QR code downloaded', 'success')
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === employees.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(employees.map((e) => e.id)))
    }
  }

  if (status === 'loading' || status === 'unauthenticated') {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Employee Directory</h1>
            <p className="text-white/50 text-sm mt-1">{employees.length} employees</p>
          </div>
          <Link
            href="/admin/employees/new"
            className="inline-flex items-center gap-2 bg-ztex-red hover:bg-ztex-dark-red text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>

        {/* Search & Bulk Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, title, or ID..."
              className="w-full bg-ztex-dark border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-ztex-red focus:ring-1 focus:ring-ztex-red transition-colors text-sm"
            />
          </div>
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-900/50 hover:bg-red-900 text-red-300 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
            >
              Delete Selected ({selected.size})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-ztex-dark rounded-xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/50">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/50 mb-4">No employees found</p>
              <Link href="/admin/employees/new" className="text-ztex-red hover:underline text-sm">
                Add your first employee
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.size === employees.length && employees.length > 0}
                        onChange={toggleAll}
                        className="rounded accent-ztex-red"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider hidden sm:table-cell">Title</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider hidden md:table-cell">Auth.</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider hidden md:table-cell">Lic.</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => {
                    const authCount = JSON.parse(emp.authorizations).length
                    const licCount = JSON.parse(emp.licenses).length
                    return (
                      <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(emp.id)}
                            onChange={() => toggleSelect(emp.id)}
                            className="rounded accent-ztex-red"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{emp.fullName}</div>
                          <div className="text-xs text-white/40 sm:hidden">{emp.title}</div>
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm hidden sm:table-cell">{emp.title}</td>
                        <td className="px-4 py-3 text-center text-white/50 text-sm hidden md:table-cell">{authCount}</td>
                        <td className="px-4 py-3 text-center text-white/50 text-sm hidden md:table-cell">{licCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/employee/${emp.id}`}
                              target="_blank"
                              className="p-2 text-white/30 hover:text-white transition-colors"
                              title="View public page"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <Link
                              href={`/admin/employees/${emp.id}/edit`}
                              className="p-2 text-white/30 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => downloadQR(emp.id, emp.fullName)}
                              className="p-2 text-white/30 hover:text-white transition-colors"
                              title="Download QR"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id, emp.fullName)}
                              className="p-2 text-white/30 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
