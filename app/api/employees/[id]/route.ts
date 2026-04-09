import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const employee = await prisma.employee.findUnique({ where: { id } })

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  return NextResponse.json(employee)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { fullName, title, authorizations, licenses, employeeId } = body

  if (!fullName || !title) {
    return NextResponse.json({ error: 'Name and title are required' }, { status: 400 })
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        fullName,
        title,
        authorizations: JSON.stringify(authorizations || []),
        licenses: JSON.stringify(licenses || []),
        employeeId: employeeId || null,
      },
    })
    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    await prisma.employee.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
}
