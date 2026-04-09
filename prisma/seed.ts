import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed admin user
  const hashedPassword = await hash('ztex2026', 12)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })
  console.log('Admin user seeded')

  // Seed employees
  const employees = [
    {
      employeeId: 'EMP-001',
      fullName: 'Carlos Mendoza',
      title: 'Project Superintendent',
      authorizations: JSON.stringify([
        'Heavy Equipment Operation',
        'Confined Space Entry',
        'Excavation Competent Person',
        'Traffic Control Supervisor',
      ]),
      licenses: JSON.stringify([
        'OSHA 30-Hour Construction',
        'Texas Class A CDL',
        'First Aid/CPR Certified',
      ]),
    },
    {
      employeeId: 'EMP-002',
      fullName: 'Maria Elena Torres',
      title: 'Safety Director',
      authorizations: JSON.stringify([
        'Lockout/Tagout Authorized',
        'Fall Protection Competent Person',
        'Crane Signal Person',
        'Hazmat Operations',
      ]),
      licenses: JSON.stringify([
        'OSHA 500 Trainer',
        'CHST (Construction Health & Safety Technician)',
        'Texas PE License',
        'EMT-Basic',
      ]),
    },
    {
      employeeId: 'EMP-003',
      fullName: 'James "JR" Rodriguez',
      title: 'Heavy Equipment Operator',
      authorizations: JSON.stringify([
        'Crane Operation (50+ ton)',
        'Excavator Operation',
        'Dozer Operation',
        'Roller/Compactor Operation',
      ]),
      licenses: JSON.stringify([
        'NCCCO Crane Operator',
        'Texas Class A CDL',
        'OSHA 10-Hour Construction',
        'MSHA Part 46',
      ]),
    },
    {
      employeeId: 'EMP-004',
      fullName: 'David Park',
      title: 'Quality Control Manager',
      authorizations: JSON.stringify([
        'Nuclear Density Gauge Operation',
        'Concrete Testing',
        'Soil Compaction Testing',
        'Asphalt Mix Design Review',
      ]),
      licenses: JSON.stringify([
        'ACI Concrete Field Testing Grade I',
        'ICC Special Inspector',
        'Texas PE License',
        'Radiation Safety Officer',
      ]),
    },
    {
      employeeId: 'EMP-005',
      fullName: 'Angela Reeves',
      title: 'Fleet Manager',
      authorizations: JSON.stringify([
        'DOT Vehicle Inspection',
        'Fuel System Maintenance',
        'GPS/Telematics Administration',
        'Parts Procurement ($50K limit)',
      ]),
      licenses: JSON.stringify([
        'ASE Master Technician',
        'Texas Class A CDL',
        'Hazmat Endorsement',
        'FMCSA Compliance Officer',
      ]),
    },
    {
      employeeId: 'EMP-006',
      fullName: 'Roberto "Bobby" Salas',
      title: 'Foreman',
      authorizations: JSON.stringify([
        'Concrete Placement Supervision',
        'Grading & Drainage',
        'Utility Installation',
        'Crew Lead (up to 15)',
      ]),
      licenses: JSON.stringify([
        'OSHA 30-Hour Construction',
        'Texas Class B CDL',
        'ACI Flatwork Finisher',
        'Bilingual Safety Trainer',
      ]),
    },
  ]

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: emp,
      create: emp,
    })
  }

  console.log(`${employees.length} employees seeded`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
