import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attaches the JWT to every outgoing request, so no page has to remember to do it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error

    // A 401 on a normal request means the token has expired or been tampered with,
    // so we clear it. Login and register are excluded: a 401 there just means the
    // password was wrong, and the form should show that instead of reloading.
    const isAuthAttempt = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/register')

    if (response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1'
      }
    }

    // Every page can then rely on error.message and error.errors being present,
    // whatever went wrong.
    return Promise.reject({
      message: response?.data?.message || error.message || 'Something went wrong',
      errors: response?.data?.errors || null,
      status: response?.status,
    })
  }
)

// The API always answers with { success, message, data }. Callers only ever want
// the data half, so unwrap it here rather than writing res.data.data everywhere.
export const unwrap = (response) => response.data.data

export default api
