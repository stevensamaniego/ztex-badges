import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import JSZip from 'jszip'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ids = request.nextUrl.searchParams.get('ids')
  const single = request.nextUrl.searchParams.get('id')
  const baseUrl = request.nextUrl.searchParams.get('baseUrl') || request.nextUrl.origin

  if (single) {
    const employee = await prisma.employee.findUnique({ where: { id: single } })
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const url = `${baseUrl}/employee/${employee.id}`
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#0c0c0c', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })

    return NextResponse.json({ qr: qrDataUrl, name: employee.fullName })
  }

  // Bulk QR generation
  const where = ids ? { id: { in: ids.split(',') } } : undefined
  const employees = await prisma.employee.findMany({ where, orderBy: { fullName: 'asc' } })

  const zip = new JSZip()

  for (const employee of employees) {
    const url = `${baseUrl}/employee/${employee.id}`
    const qrBuffer = await QRCode.toBuffer(url, {
      width: 400,
      margin: 2,
      color: { dark: '#0c0c0c', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })

    const safeName = employee.fullName.replace(/[^a-zA-Z0-9]/g, '_')
    zip.file(`${safeName}_QR.png`, qrBuffer)
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="ztex-qr-codes.zip"',
    },
  })
}
