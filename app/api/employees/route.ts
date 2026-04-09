import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const search = request.nextUrl.searchParams.get('search') || ''

  const employees = await prisma.employee.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search } },
            { title: { contains: search } },
            { employeeId: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { fullName: 'asc' },
  })

  return NextResponse.json(employees)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { fullName, title, authorizations, licenses, employeeId } = body

  if (!fullName || !title) {
    return NextResponse.json({ error: 'Name and title are required' }, { status: 400 })
  }

  const employee = await prisma.employee.create({
    data: {
      fullName,
      title,
      authorizations: JSON.stringify(authorizations || []),
      licenses: JSON.stringify(licenses || []),
      employeeId: employeeId || null,
    },
  })

  return NextResponse.json(employee, { status: 201 })
}
