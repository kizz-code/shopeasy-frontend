import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertTriangle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import { calculatePricing, FREE_SHIPPING_THRESHOLD } from '../utils/pricing'
import EmptyState from '../components/common/EmptyState'
import ProductImage from '../components/common/ProductImage'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()

  if (loading && cart.items.length === 0) {
    return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          message="Browse the catalogue and add something you like."
          actionLabel="Start shopping"
          actionTo="/products"
        />
      </div>
    )
  }

  // Only available items count towards the total - the backend does the same,
  // so what is shown here matches what the order will be charged at.
  const pricing = calculatePricing(cart.totalPrice)
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - cart.totalPrice

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Shopping <span className="gradient-text">Cart</span>
          </h1>
          <p className="text-dark-400 mt-1">
            {cart.totalItems} item{cart.totalItems === 1 ? '' : 's'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-dark-400 hover:text-red-400 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Trash2 size={15} />
          <span className="hidden sm:inline">Clear cart</span>
        </button>
      </div>

      {cart.hasUnavailableItems && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            Some items are out of stock or no longer sold. Remove them to continue to checkout.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem
              key={item.product}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="glass-card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-dark-300">Subtotal</dt>
                <dd className="text-white">{formatPrice(pricing.itemsTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dark-300">Shipping</dt>
                <dd className={pricing.shippingCharge === 0 ? 'text-green-400' : 'text-white'}>
                  {pricing.shippingCharge === 0 ? 'Free' : formatPrice(pricing.shippingCharge)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dark-300">GST (18%)</dt>
                <dd className="text-white">{formatPrice(pricing.taxAmount)}</dd>
              </div>

              {amountToFreeShipping > 0 && (
                <p className="bg-dark-700 rounded-lg px-3 py-2 text-xs text-dark-300">
                  Add {formatPrice(amountToFreeShipping)} more for free shipping
                </p>
              )}

              <div className="border-t border-dark-600 pt-3 flex justify-between font-bold text-base">
                <dt className="text-white">Total</dt>
                <dd className="text-brand-400">{formatPrice(pricing.grandTotal)}</dd>
              </div>
            </dl>

            <button
              onClick={() => navigate('/checkout')}
              disabled={cart.hasUnavailableItems || cart.totalPrice === 0}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-dark-400 hover:text-brand-400 transition-colors mt-4"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const lineTotal = item.price * item.quantity

  return (
    <div className={`glass-card p-4 flex gap-4 ${item.isAvailable ? '' : 'opacity-60'}`}>
      <Link to={`/products/${item.slug || item.product}`} className="shrink-0">
        <ProductImage
          src={item.image}
          alt={item.name}
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-dark-600 bg-dark-700"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/products/${item.slug || item.product}`}
            className="font-semibold text-white hover:text-brand-400 transition-colors line-clamp-2 text-sm sm:text-base"
          >
            {item.name}
          </Link>
          <button
            onClick={() => onRemove(item.product)}
            aria-label={`Remove ${item.name} from cart`}
            className="text-dark-500 hover:text-red-400 transition-colors p-1 shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {!item.isAvailable && (
          <span className="text-xs text-amber-400 mt-1">Out of stock</span>
        )}

        <div className="flex items-end justify-between gap-3 mt-auto pt-3">
          <div className="flex items-center gap-1 bg-dark-700 rounded-lg border border-dark-600 p-1">
            <button
              onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
              className="w-7 h-7 grid place-items-center rounded text-dark-300 hover:text-white hover:bg-dark-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-white text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
              className="w-7 h-7 grid place-items-center rounded text-dark-300 hover:text-white hover:bg-dark-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-brand-400 font-bold">{formatPrice(lineTotal)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-dark-500">{formatPrice(item.price)} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
