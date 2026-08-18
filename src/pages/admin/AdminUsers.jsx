import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Search, ShieldCheck } from 'lucide-react'
import { adminService } from '../../services/adminService'
import useDebounce from '../../hooks/useDebounce'
import { formatDate } from '../../utils/format'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await adminService.users({
        page, limit: 15, ...(search.trim() && { search: search.trim() }),
      })
      setUsers(result.users)
      setPagination(result.pagination)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  const toggleStatus = async (user) => {
    try {
      const { isActive } = await adminService.toggleUserStatus(user._id)
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isActive } : u)))
      toast.success(`${user.name} ${isActive ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-dark-400 text-sm mt-1">{pagination?.totalItems ?? 0} registered</p>
      </header>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search users"
          className="input-field pl-10 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <EmptyState title="Could not load users" message={error} actionLabel="Retry" onAction={load} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="Nothing matches that search." />
      ) : (
        <>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead>
                <tr className="border-b border-dark-600 text-dark-400 text-xs uppercase tracking-wide">
                  <th className="text-left font-medium px-4 py-3">User</th>
                  <th className="text-left font-medium px-4 py-3">Role</th>
                  <th className="text-left font-medium px-4 py-3">Joined</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-dark-700 border border-dark-600 grid place-items-center text-dark-300 text-xs font-bold shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-white line-clamp-1">{user.name}</p>
                          <p className="text-dark-500 text-xs line-clamp-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-brand-500/10 text-brand-400 border-brand-500/30">
                          <ShieldCheck size={11} /> Admin
                        </span>
                      ) : (
                        <span className="text-dark-400 text-xs">Customer</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dark-300 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        user.isActive
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {user.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role === 'admin' ? (
                        <span className="text-dark-500 text-xs">—</span>
                      ) : (
                        <button
                          onClick={() => toggleStatus(user)}
                          className="text-xs text-dark-400 hover:text-brand-400 transition-colors"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
