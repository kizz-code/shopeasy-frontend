import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-7xl font-bold text-dark-500 mb-4">404</p>

        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-dark-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist, or it has moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Home size={16} />
            Back to home
          </Link>
          <Link to="/products" className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Search size={16} />
            Browse products
          </Link>
        </div>
      </div>
    </div>
  )
}
