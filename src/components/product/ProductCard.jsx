import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, primaryImage, effectivePrice, discountPercent } from '../../utils/format'
import ProductImage from '../common/ProductImage'

export default function ProductCard({ product }) {
  const { addToCart, getItemQuantity } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const image = primaryImage(product)
  const price = effectivePrice(product)
  const discount = discountPercent(product)
  const quantityInCart = getItemQuantity(product._id)
  const outOfStock = product.stock === 0

  // The whole card is a link to the product, so the cart button has to stop the
  // click from bubbling up and navigating away.
  const handleAddToCart = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart')
      navigate('/login', { state: { from: `/products/${product.slug || product._id}` } })
      return
    }
    addToCart(product._id)
  }

  return (
    <Link to={`/products/${product.slug || product._id}`} className="group block">
      <article className="glass-card h-full flex flex-col overflow-hidden transition-all duration-300 hover:border-brand-500/40 hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-dark-700">
          <ProductImage
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {discount > 0 && !outOfStock && (
            <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              {discount}% OFF
            </span>
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-dark-900/75 grid place-items-center">
              <span className="bg-dark-800 border border-dark-600 text-dark-300 text-sm px-3 py-1.5 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-brand-400 font-medium mb-1 uppercase tracking-wide">
            {product.category?.name || product.brand || 'ShopEasy'}
          </p>

          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-300 transition-colors">
            {product.name}
          </h3>

          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-dark-300">{product.rating}</span>
              <span className="text-xs text-dark-500">({product.numReviews})</span>
            </div>
          )}

          <div className="flex items-end justify-between gap-2 mt-auto pt-2">
            <div className="min-w-0">
              <span className="text-lg font-bold text-white">{formatPrice(price)}</span>
              {discount > 0 && (
                <span className="text-xs text-dark-500 line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              aria-label={quantityInCart > 0 ? `${product.name} is in your cart` : `Add ${product.name} to cart`}
              className={`shrink-0 p-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                ${quantityInCart > 0
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-brand-500 hover:bg-brand-600 text-white'}`}
            >
              {quantityInCart > 0 ? <Check size={17} /> : <ShoppingCart size={17} />}
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
