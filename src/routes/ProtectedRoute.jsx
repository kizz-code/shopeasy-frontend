import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Wraps routes that need a logged-in user. While the stored token is still being
 * verified we show a spinner rather than bouncing to /login, otherwise a refresh
 * on /cart would throw the user out before the check finished.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated) {
    // Remember where they were going so login can send them back.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
