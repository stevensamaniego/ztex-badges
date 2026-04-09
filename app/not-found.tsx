import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ztex-black flex items-center justify-center px-4">
      <div className="text-center">
        <Image
          src="/images/ztex-logo-main.png"
          alt="ZTEX Construction"
          width={200}
          height={60}
          className="mx-auto mb-8"
        />
        <h1 className="text-6xl font-bold text-ztex-red mb-4">404</h1>
        <p className="text-xl text-ztex-light mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-block bg-ztex-red hover:bg-ztex-dark-red text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
