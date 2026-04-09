import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const employee = await prisma.employee.findUnique({ where: { id } })

  if (!employee) notFound()

  const authorizations: string[] = JSON.parse(employee.authorizations)
  const licenses: string[] = JSON.parse(employee.licenses)

  return (
    <div className="min-h-screen bg-ztex-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-ztex-dark-red to-ztex-red py-6">
        <div className="max-w-lg mx-auto px-4 flex justify-center">
          <Image
            src="/images/ztex-logo-white.png"
            alt="ZTEX Construction Inc."
            width={180}
            height={54}
            priority
          />
        </div>
      </div>

      {/* Employee Card */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-ztex-dark rounded-2xl overflow-hidden shadow-2xl border border-white/5">
          {/* Name Header */}
          <div className="bg-gradient-to-r from-ztex-red to-ztex-dark-red p-6 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
              <span className="text-3xl font-bold text-white">
                {employee.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{employee.fullName}</h1>
            <p className="text-white/80 mt-1 text-lg">{employee.title}</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {authorizations.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ztex-red uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Authorizations
                </h2>
                <ul className="space-y-2">
                  {authorizations.map((auth, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-ztex-light bg-white/5 rounded-lg px-4 py-2.5"
                    >
                      <span className="text-ztex-red mt-0.5 shrink-0">&#10003;</span>
                      <span>{auth}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {licenses.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ztex-red uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Licenses &amp; Certifications
                </h2>
                <ul className="space-y-2">
                  {licenses.map((lic, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-ztex-light bg-white/5 rounded-lg px-4 py-2.5"
                    >
                      <span className="text-ztex-red mt-0.5 shrink-0">&#9670;</span>
                      <span>{lic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-6 py-4 text-center">
            <p className="text-xs text-white/30">
              ZTEX Construction Inc. &mdash; Employee Verification
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
