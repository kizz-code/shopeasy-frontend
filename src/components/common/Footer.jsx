import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 bg-brand-500 rounded-lg grid place-items-center text-white font-bold text-sm font-display">
                S
              </span>
              <span className="font-display font-bold text-xl text-white">
                Shop<span className="text-brand-400">Easy</span>
              </span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed max-w-sm">
              A full-stack e-commerce store built with React, Express and MongoDB.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-semibold text-white mb-4 text-sm">Shop</h2>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><Link to="/products" className="hover:text-brand-400 transition-colors">All products</Link></li>
              <li><Link to="/cart" className="hover:text-brand-400 transition-colors">My cart</Link></li>
              <li><Link to="/orders" className="hover:text-brand-400 transition-colors">My orders</Link></li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-dark-600 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-dark-500">
          <p>© {new Date().getFullYear()} ShopEasy — a MERN stack learning project.</p>
          <a
            href="https://github.com/kizz-code"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 hover:text-brand-400 transition-colors"
          >
            <Github size={15} />
            Source
          </a>
        </div>
      </div>
    </footer>
  )
}
