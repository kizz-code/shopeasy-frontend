import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { cartService } from '../services/cartService'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const EMPTY_CART = { items: [], totalItems: 0, totalPrice: 0, hasUnavailableItems: false }

/**
 * The cart lives in MongoDB, not in the browser, so it follows the user to another
 * device and cannot be edited from the console. This context is just a cached copy
 * of the server's cart: every action sends a request and replaces the local state
 * with whatever the server says the cart now is.
 */
export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(EMPTY_CART)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART)
      return
    }
    setLoading(true)
    cartService
      .get()
      .then(setCart)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  // All four mutations do the same thing: call the API, swap in the returned cart,
  // and surface the server's message if it refused.
  const run = useCallback(async (action, successMessage) => {
    try {
      setCart(await action())
      if (successMessage) toast.success(successMessage)
      return true
    } catch (error) {
      toast.error(error.message)
      return false
    }
  }, [])

  const value = {
    cart,
    loading,
    addToCart: (productId, quantity = 1) =>
      run(() => cartService.add(productId, quantity), 'Added to cart'),
    updateQuantity: (productId, quantity) =>
      run(() => cartService.updateQuantity(productId, quantity)),
    removeFromCart: (productId) => run(() => cartService.remove(productId), 'Item removed'),
    clearCart: () => run(() => cartService.clear()),
    refreshCart: () => run(() => cartService.get()),
    getItemQuantity: (productId) =>
      cart.items.find((item) => item.product === productId)?.quantity || 0,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
