/**
 * Auth Context
 * Manages authentication state across the app
 * Persists user and token to localStorage
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Verify token on mount (handles expired tokens)
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.data.user)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      } catch {
        // Token invalid - clear everything
        logout(false)
      } finally {
        setLoading(false)
      }
    }
    verifyAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const { user: userData, token: authToken } = data.data

    setUser(userData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))

    toast.success(data.message)
    return userData
  }, [])

  const register = useCallback(async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone })
    const { user: userData, token: authToken } = data.data

    setUser(userData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))

    toast.success(data.message)
    return userData
  }, [])

  const logout = useCallback((showToast = true) => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (showToast) toast.success('Logged out successfully')
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, isAuthenticated,
      login, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
