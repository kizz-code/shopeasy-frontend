import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Zap } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url
  const effectivePrice = product.discountedPrice > 0 ? product.discountedPrice : product.price
  const discount = product.discountedPrice > 0
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0
  const inCart = isInCart(product._id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    await addToCart(product._id)
  }

  return (
    <Link to={`/products/${product.slug || product._id}`} className="group block">
      <div className="glass-card overflow-hidden transition-all duration-300 hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-dark-700">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-dark-600 rounded-full flex items-center justify-center">
                <ShoppingCart size={24} className="text-gray-500" />
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge bg-brand-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-1 rounded-lg">
                <Zap size={10} className="inline mr-0.5" /> Featured
              </span>
            )}
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center">
              <span className="badge bg-dark-800 text-gray-400 border border-dark-600 px-3 py-1.5">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-brand-400 font-medium mb-1 uppercase tracking-wide">
            {product.category?.name || product.brand}
          </p>
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 mb-2 group-hover:text-brand-300 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.numReviews})</span>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white">₹{effectivePrice.toLocaleString('en-IN')}</span>
              {discount > 0 && (
                <span className="text-xs text-gray-500 line-through ml-2">₹{product.price.toLocaleString('en-IN')}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || inCart}
              className={`p-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
                ${inCart
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ShoppingCart size={17} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
