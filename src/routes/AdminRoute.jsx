// AdminRoute.jsx - Requires admin role
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}

export default AdminRoute
