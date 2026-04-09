import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

interface ImportRow {
  employee_id?: string
  full_name: string
  title: string
  authorizations?: string
  licenses?: string
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const preview = formData.get('preview') === 'true'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet)

  const results = { newCount: 0, updateCount: 0, unchangedCount: 0, errors: [] as string[] }
  const operations: { type: 'create' | 'update'; data: ImportRow }[] = []

  for (const row of rows) {
    if (!row.full_name || !row.title) {
      results.errors.push(`Skipped row: missing full_name or title`)
      continue
    }

    const authorizations = row.authorizations
      ? row.authorizations.split(';').map((s: string) => s.trim()).filter(Boolean)
      : []
    const licenses = row.licenses
      ? row.licenses.split(';').map((s: string) => s.trim()).filter(Boolean)
      : []

    if (row.employee_id) {
      const existing = await prisma.employee.findUnique({
        where: { employeeId: row.employee_id },
      })

      if (existing) {
        operations.push({ type: 'update', data: row })
        results.updateCount++
      } else {
        operations.push({ type: 'create', data: row })
        results.newCount++
      }
    } else {
      operations.push({ type: 'create', data: row })
      results.newCount++
    }

    if (!preview) {
      const data = {
        fullName: row.full_name,
        title: row.title,
        authorizations: JSON.stringify(authorizations),
        licenses: JSON.stringify(licenses),
      }

      if (row.employee_id) {
        const existing = await prisma.employee.findUnique({
          where: { employeeId: row.employee_id },
        })
        if (existing) {
          await prisma.employee.update({
            where: { employeeId: row.employee_id },
            data,
          })
        } else {
          await prisma.employee.create({
            data: { ...data, employeeId: row.employee_id },
          })
        }
      } else {
        await prisma.employee.create({ data })
      }
    }
  }

  return NextResponse.json(results)
}
