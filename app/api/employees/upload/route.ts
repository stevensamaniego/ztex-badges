import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('photo') as File | null
  const employeeId = formData.get('employeeId') as string | null

  if (!file || !employeeId) {
    return NextResponse.json({ error: 'Missing photo or employeeId' }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  // Limit to 2MB
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 2MB' }, { status: 400 })
  }

  // Convert to base64 data URL
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const dataUrl = `data:${file.type};base64,${base64}`

  // Update employee
  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: { photoUrl: dataUrl },
  })

  return NextResponse.json({ success: true, photoUrl: employee.photoUrl })
}
