'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminNav } from '@/app/components/AdminNav'
import { EmployeeForm } from '@/app/components/EmployeeForm'

export default function NewEmployeePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-ztex-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ztex-black">
      <AdminNav />
      <EmployeeForm />
    </div>
  )
}
