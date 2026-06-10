import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dark-800 rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dark-800 rounded-full opacity-20" />
      </div>

      <div className="text-center relative z-10 max-w-lg mx-auto">
        {/* Giant 404 */}
        <div className="relative mb-6 select-none">
          <p
            className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #f17023 0%, #ff8c42 40%, #1a1a2e 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 60px rgba(241,112,35,0.15))',
            }}
          >
            404
          </p>
          {/* Floating icon over the zero */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-dark-800/80 border border-dark-700 backdrop-blur-sm flex items-center justify-center shadow-xl mt-4">
              <Search className="w-7 h-7 sm:w-8 sm:h-8 text-brand-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-dark-400 text-base sm:text-lg mb-2 leading-relaxed">
          Looks like this page wandered off somewhere.
        </p>
        <p className="text-dark-600 text-sm mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-dark-800">
          <p className="text-dark-500 text-xs mb-3">Quick links</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {[
              { label: 'Home', to: '/' },
              { label: 'Products', to: '/products' },
              { label: 'My Orders', to: '/orders' },
              { label: 'Profile', to: '/profile' },
              { label: 'Cart', to: '/cart' },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-dark-400 hover:text-brand-400 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
