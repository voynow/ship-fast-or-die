import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-4xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-medium hover:text-gray-600">
          Ship Fast Or Die
        </Link>

        <a
          href="http://localhost:8000/auth/github/login"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Add your product
        </a>
      </div>
    </nav>
  )
} 