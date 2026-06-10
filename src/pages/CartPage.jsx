import { } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
} from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartLoading } = useCart();
  const { user } = useAuth();
  const cartTotal = cart?.totalPrice || 0;
  const cartCount = cart?.totalItems || 0;
  const navigate = useNavigate();

  const shipping = cartTotal > 999 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const grandTotal = cartTotal + shipping + tax;

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-dark-800 border border-dark-700 mb-6">
            <ShoppingCart className="w-10 h-10 text-dark-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-dark-400 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-dark-400 mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-dark-400 hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {(cart?.items || []).map((item) => (
              <div key={item.product._id} className="glass-card p-4 flex gap-4">
                {/* Product Image */}
                <Link to={`/products/${item.product._id}`} className="flex-shrink-0">
                  <img
                    src={item.product.images?.[0] || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg border border-dark-700"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/products/${item.product._id}`}
                        className="font-semibold text-white hover:text-brand-400 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {item.product.category && (
                          <span className="badge">{item.product.category}</span>
                        )}
                        {item.selectedSize && (
                          <span className="text-xs text-dark-400">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="text-xs text-dark-400">Color: {item.selectedColor}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-dark-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-dark-800 rounded-lg border border-dark-700 p-1">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded text-dark-300 hover:text-white hover:bg-dark-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-white text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product.stock || 99)}
                        className="w-7 h-7 flex items-center justify-center rounded text-dark-300 hover:text-white hover:bg-dark-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                        <p className="text-xs text-dark-500 line-through">
                          ₹{(item.product.originalPrice * item.quantity).toLocaleString()}
                        </p>
                      )}
                      <p className="text-brand-400 font-bold text-lg">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-400" />
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-dark-300">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-400">Free</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>

                {shipping === 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs text-green-400">
                    🎉 You qualify for free shipping!
                  </div>
                )}
                {shipping > 0 && (
                  <div className="bg-dark-800 rounded-lg px-3 py-2 text-xs text-dark-400">
                    Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping
                  </div>
                )}

                <div className="border-t border-dark-700 pt-3 flex justify-between font-bold text-white text-base">
                  <span>Total</span>
                  <span className="text-brand-400">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(user ? '/checkout' : '/login?redirect=/checkout')}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-dark-400 hover:text-brand-400 transition-colors mt-4"
              >
                ← Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-dark-700 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: '🔒', label: 'Secure Payment' },
                  { icon: '↩️', label: 'Easy Returns' },
                  { icon: '🚚', label: 'Fast Delivery' },
                ].map((b) => (
                  <div key={b.label} className="text-xs text-dark-400">
                    <div className="text-lg mb-1">{b.icon}</div>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
