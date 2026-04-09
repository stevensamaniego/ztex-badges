'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminNav } from '@/app/components/AdminNav'
import { EmployeeForm } from '@/app/components/EmployeeForm'

export default function EditEmployeePage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [employee, setEmployee] = useState<{
    id: string
    employeeId: string | null
    fullName: string
    title: string
    authorizations: string[]
    licenses: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetch(`/api/employees/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found')
          return res.json()
        })
        .then((data) => {
          setEmployee({
            ...data,
            authorizations: JSON.parse(data.authorizations),
            licenses: JSON.parse(data.licenses),
          })
          setLoading(false)
        })
        .catch(() => {
          router.push('/admin')
        })
    }
  }, [status, params.id, router])

  if (status !== 'authenticated' || loading) {
    return (
      <div className="min-h-screen bg-ztex-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ztex-black">
      <AdminNav />
      {employee && <EmployeeForm initialData={employee} />}
    </div>
  )
}
