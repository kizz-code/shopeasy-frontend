import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Guards the /admin section. This is a convenience for the UI only - every admin
 * API route checks the role again on the server, because a route guard in the
 * browser can be bypassed by anyone who opens devtools.
 */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
