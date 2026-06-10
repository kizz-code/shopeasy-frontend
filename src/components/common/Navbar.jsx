import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Shield, LogOut, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-dark-800/95 backdrop-blur-md border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-sm font-display">S</span>
            </div>
            <span className="font-display font-bold text-xl text-white hidden sm:block">
              Shop<span className="text-brand-400">Easy</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-dark-700 border border-dark-600 rounded-xl pl-4 pr-12 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-400 transition-colors">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/products" className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'text-brand-400 bg-brand-500/10' : 'text-gray-300 hover:text-white hover:bg-dark-700'}`
            }>
              Products
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'text-brand-400 bg-brand-500/10' : 'text-gray-300 hover:text-white hover:bg-dark-700'}`
              }>
                <Shield size={15} />
                Admin
              </NavLink>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-colors">
              <ShoppingCart size={20} />
              {cart.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cart.totalItems > 9 ? '9+' : cart.totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                    <span className="text-brand-400 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-card shadow-2xl animate-slide-down overflow-hidden">
                    <div className="px-4 py-3 border-b border-dark-600">
                      <p className="font-semibold text-white text-sm">{user?.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-700 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-700 transition-colors">
                        <Package size={16} /> My Orders
                      </Link>
                      <hr className="border-dark-600 my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-5">
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-300">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-600 bg-dark-800 animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="input-field text-sm py-2"
              />
              <button type="submit" className="btn-primary py-2 px-4 text-sm">
                <Search size={16} />
              </button>
            </form>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Products</Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-gray-300">
              Cart {cart.totalItems > 0 && <span className="badge bg-brand-500/20 text-brand-400">{cart.totalItems}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Orders</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Profile</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-brand-400">Admin Dashboard</Link>}
                <button onClick={handleLogout} className="block py-2 text-red-400">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary block text-center py-2.5 text-sm">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
