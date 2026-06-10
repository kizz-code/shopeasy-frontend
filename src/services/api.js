/**
 * Axios API Service
 * Configured instance with request/response interceptors
 * Handles auth token injection and error normalization
 */

import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 second timeout
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attaches JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handles 401 (token expired), shows error toasts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Token expired or invalid - clear auth state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
      }
    }

    // Extract meaningful error message from backend
    const message =
      response?.data?.message ||
      response?.data?.error ||
      error.message ||
      'Something went wrong'

    return Promise.reject({ message, status: response?.status, data: response?.data })
  }
)

export default api
