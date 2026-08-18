import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

/**
 * Holds who is logged in.
 *
 * The user object and the token live in localStorage so a refresh does not log you
 * out, and in React state so components re-render when they change. localStorage is
 * only the cache - on every page load we ask the backend who this token belongs to,
 * because a token can expire or be revoked while the tab was closed.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')))

  const saveSession = useCallback((userData, token) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    if (token) localStorage.setItem('token', token)
  }, [])

  const logout = useCallback((showToast = true) => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (showToast) toast.success('Logged out')
  }, [])

  // Verify the stored token once, on mount.
  useEffect(() => {
    if (!localStorage.getItem('token')) return

    authService
      .getMe()
      .then(({ user: fresh }) => saveSession(fresh))
      .catch(() => logout(false))
      .finally(() => setLoading(false))
  }, [saveSession, logout])

  const login = useCallback(
    async (email, password) => {
      const { user: userData, token } = await authService.login(email, password)
      saveSession(userData, token)
      return userData
    },
    [saveSession]
  )

  const register = useCallback(
    async (payload) => {
      const { user: userData, token } = await authService.register(payload)
      saveSession(userData, token)
      return userData
    },
    [saveSession]
  )

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser: saveSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
