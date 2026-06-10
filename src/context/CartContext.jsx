/**
 * Cart Context
 * Global cart state management with API sync
 * Cart state persists in MongoDB (server-side) + local optimistic state
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 })
  const [cartLoading, setCartLoading] = useState(false)

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setCart({ items: [], totalItems: 0, totalPrice: 0 })
    }
  }, [isAuthenticated])

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true)
      const { data } = await api.get('/cart')
      setCart(data.data.cart)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setCartLoading(false)
    }
  }, [])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { productId, quantity })
      // Update local state optimistically
      setCart(prev => ({
        ...prev,
        totalItems: data.data.totalItems,
        totalPrice: data.data.totalPrice,
      }))
      await fetchCart() // Sync full cart
      toast.success('Added to cart!')
      return true
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart')
      return false
    }
  }, [fetchCart])

  const removeFromCart = useCallback(async (productId) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`)
      await fetchCart()
      toast.success('Item removed from cart')
      return true
    } catch (error) {
      toast.error(error.message || 'Failed to remove item')
      return false
    }
  }, [fetchCart])

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      await api.put('/cart/update', { productId, quantity })
      await fetchCart()
      return true
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity')
      return false
    }
  }, [fetchCart])

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/cart/clear')
      setCart({ items: [], totalItems: 0, totalPrice: 0 })
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }, [])

  const isInCart = useCallback((productId) => {
    return cart.items.some(item => 
      item.product?._id === productId || item.product === productId
    )
  }, [cart.items])

  const getItemQuantity = useCallback((productId) => {
    const item = cart.items.find(item => 
      item.product?._id === productId || item.product === productId
    )
    return item?.quantity || 0
  }, [cart.items])

  return (
    <CartContext.Provider value={{
      cart, cartLoading,
      fetchCart, addToCart, removeFromCart, updateQuantity, clearCart,
      isInCart, getItemQuantity,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
