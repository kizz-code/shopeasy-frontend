import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Zap, Package, ChevronLeft, Plus, Minus, Check } from 'lucide-react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { identifier } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart, getItemQuantity } = useCart()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/products/${identifier}`)
        setProduct(res.data.data.product)
      } catch {
        toast.error('Product not found')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [identifier])

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>
  if (!product) return null

  const effectivePrice = product.discountedPrice > 0 ? product.discountedPrice : product.price
  const discount = product.discountedPrice > 0
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0
  const inCart = isInCart(product._id)
  const cartQty = getItemQuantity(product._id)

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setAddingToCart(true)
    await addToCart(product._id, quantity)
    setAddingToCart(false)
  }

  const images = product.images?.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600', alt: product.name }]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square glass-card overflow-hidden rounded-2xl">
            <img
              src={images[selectedImage]?.url}
              alt={images[selectedImage]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200
                    ${i === selectedImage ? 'border-brand-500' : 'border-dark-600 hover:border-dark-400'}`}>
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category & Brand */}
          <div className="flex items-center gap-3">
            <span className="badge bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs uppercase tracking-wide">
              {product.category?.name}
            </span>
            {product.brand && (
              <span className="text-gray-400 text-sm">{product.brand}</span>
            )}
            {product.isFeatured && (
              <span className="badge bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
                <Zap size={11} className="inline" /> Featured
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18}
                    className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                ))}
              </div>
              <span className="text-white font-semibold">{product.rating}</span>
              <span className="text-gray-400 text-sm">({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-4 py-4 border-y border-dark-600">
            <span className="text-4xl font-bold text-white font-display">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <>
                <span className="text-gray-500 text-xl line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="badge bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-sm">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-300 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package size={17} className={product.stock > 0 ? 'text-green-400' : 'text-red-400'} />
            <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
              {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center gap-0 bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-dark-600 transition-colors text-gray-300 hover:text-white">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="p-3 hover:bg-dark-600 transition-colors text-gray-300 hover:text-white">
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || inCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95
                  ${inCart
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'btn-primary'} disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {addingToCart ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>
                ) : inCart ? (
                  <><Check size={18} /> In Cart ({cartQty})</>
                ) : (
                  <><ShoppingCart size={18} /> Add to Cart</>
                )}
              </button>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-dark-700 border border-dark-600 text-gray-400 text-xs">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
