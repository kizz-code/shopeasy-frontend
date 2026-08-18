import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
   ${isActive
     ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
     : 'text-dark-400 hover:bg-dark-700 hover:text-white border border-transparent'}`

export default function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen lg:flex bg-dark-900">
      {/* Below lg the sidebar becomes a scrollable strip of tabs across the top. */}
      <aside className="lg:w-64 lg:min-h-screen bg-dark-800 border-b lg:border-b-0 lg:border-r border-dark-600 flex flex-col">
        <div className="p-4 lg:p-6 lg:border-b border-dark-600 flex items-center justify-between lg:block">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-500 rounded-lg grid place-items-center text-white font-bold text-sm">
              S
            </span>
            <span className="font-display font-bold text-lg text-white">ShopEasy</span>
          </Link>

          <div className="hidden lg:flex items-center gap-3 mt-4">
            <span className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 grid place-items-center text-brand-400 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-dark-400">Administrator</p>
            </div>
          </div>

          <Link
            to="/"
            className="lg:hidden flex items-center gap-1.5 text-xs text-dark-400 hover:text-white transition-colors"
          >
            <Store size={14} />
            Storefront
          </Link>
        </div>

        <nav className="flex lg:flex-col gap-1 p-3 lg:p-4 lg:flex-1 overflow-x-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block p-4 border-t border-dark-600 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
          >
            <Store size={17} />
            View storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
