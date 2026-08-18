import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Star, ShoppingCart, Package, ChevronLeft, Plus, Minus, Check } from 'lucide-react'
import { productService } from '../services/productService'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, effectivePrice, discountPercent } from '../utils/format'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import ProductImage from '../components/common/ProductImage'

export default function ProductDetailPage() {
  const { identifier } = useParams()
  const navigate = useNavigate()
  const { addToCart, getItemQuantity } = useCart()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setLoading(true)
    setQuantity(1)
    setSelectedImage(0)

    productService
      .getOne(identifier)
      .then((data) => { setProduct(data); setError(null) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [identifier])

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Product not found"
          message={error || 'This product may have been removed.'}
          actionLabel="Browse all products"
          actionTo="/products"
        />
      </div>
    )
  }

  const price = effectivePrice(product)
  const discount = discountPercent(product)
  const quantityInCart = getItemQuantity(product._id)
  const outOfStock = product.stock === 0
  const images = product.images?.length ? product.images : [{ url: '', alt: product.name }]

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart')
      navigate('/login', { state: { from: `/products/${identifier}` } })
      return
    }
    setAdding(true)
    await addToCart(product._id, quantity)
    setAdding(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-8"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square glass-card overflow-hidden">
            <ProductImage
              src={images[selectedImage]?.url}
              alt={images[selectedImage]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors
                    ${index === selectedImage ? 'border-brand-500' : 'border-dark-600 hover:border-dark-500'}`}
                >
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {product.category && (
              <Link
                to={`/products?category=${product.category._id}`}
                className="text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 transition-colors"
              >
                {product.category.name}
              </Link>
            )}
            {product.brand && <span className="text-dark-400 text-sm">{product.brand}</span>}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            {product.name}
          </h1>

          {product.numReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}
                  />
                ))}
              </div>
              <span className="text-white font-semibold text-sm">{product.rating}</span>
              <span className="text-dark-400 text-sm">({product.numReviews} reviews)</span>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3 py-4 border-y border-dark-600">
            <span className="text-4xl font-bold text-white font-display">{formatPrice(price)}</span>
            {discount > 0 && (
              <>
                <span className="text-dark-500 text-xl line-through">{formatPrice(product.price)}</span>
                <span className="text-green-400 font-bold text-sm bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          <p className="text-dark-300 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className={outOfStock ? 'text-red-400' : 'text-green-400'} />
            <span className={outOfStock ? 'text-red-400' : 'text-green-400'}>
              {outOfStock
                ? 'Out of stock'
                : product.stock < 10
                  ? `Only ${product.stock} left`
                  : 'In stock'}
            </span>
          </div>

          {!outOfStock && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-3 text-dark-300 hover:text-white hover:bg-dark-600 transition-colors disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="p-3 text-dark-300 hover:text-white hover:bg-dark-600 transition-colors disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3.5"
              >
                {adding ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding…
                  </>
                ) : (
                  <><ShoppingCart size={18} /> Add to cart</>
                )}
              </button>
            </div>
          )}

          {quantityInCart > 0 && (
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              <Check size={15} />
              {quantityInCart} already in your cart — view cart
            </Link>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs text-dark-400 bg-dark-700 border border-dark-600 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {product.reviews?.length > 0 && (
        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-5">Reviews</h2>
          <ul className="space-y-4">
            {product.reviews.map((review) => (
              <li key={review._id} className="glass-card p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-white font-medium text-sm">{review.name}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-dark-300 text-sm">{review.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
