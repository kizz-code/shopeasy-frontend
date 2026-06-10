import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">S</span>
              </div>
              <span className="font-display font-bold text-xl text-white">Shop<span className="text-brand-400">Easy</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your premium destination for quality products. Shop smart, live well with ShopEasy.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-brand-400 transition-colors">All Products</Link></li>
              <li><Link to="/cart" className="hover:text-brand-400 transition-colors">My Cart</Link></li>
              <li><Link to="/orders" className="hover:text-brand-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span className="hover:text-brand-400 transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-brand-400 transition-colors cursor-pointer">Returns Policy</span></li>
              <li><span className="hover:text-brand-400 transition-colors cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-600 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 ShopEasy. Built with MERN Stack — React, Node.js, Express, MongoDB.</p>
        </div>
      </div>
    </footer>
  )
}
