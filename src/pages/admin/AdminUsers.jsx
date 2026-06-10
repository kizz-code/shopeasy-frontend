import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Search, Users, Shield, ChevronLeft, ChevronRight,
  ToggleLeft, ToggleRight, Filter,
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [togglingId, setTogglingId] = useState(null);
  const LIMIT = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        sort: '-createdAt',
      });
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (user) => {
    setTogglingId(user._id);
    try {
      const newStatus = !user.isActive;
      await api.put(`/admin/users/${user._id}/status`, { isActive: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
      );
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  const getInitials = (name) =>
    name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            <span className="gradient-text">Users</span> Management
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">{total} registered users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              className="input-field pl-9 text-sm w-60"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-dark-500" />
            <select
              className="input-field text-sm cursor-pointer"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="all" className="bg-dark-800">All Roles</option>
              <option value="customer" className="bg-dark-800">Customers</option>
              <option value="admin" className="bg-dark-800">Admins</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-dark-500">
              <Users className="w-10 h-10 mb-3" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-800/50">
                    {['User', 'Email', 'Role', 'Orders', 'Joined', 'Status', 'Action'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            user.role === 'admin'
                              ? 'bg-brand-500/20 border border-brand-500/30 text-brand-400'
                              : 'bg-dark-700 border border-dark-600 text-dark-300'
                          }`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-xs">{user.name || '—'}</p>
                            {user.phone && (
                              <p className="text-dark-600 text-xs">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark-400 text-xs">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium flex items-center gap-1 w-fit ${
                          user.role === 'admin'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                            : 'bg-dark-700 text-dark-400 border-dark-600'
                        }`}>
                          {user.role === 'admin' && <Shield className="w-2.5 h-2.5" />}
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-300 text-xs text-center">
                        {user.orderCount ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-dark-500 text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          user.isActive !== false
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(user)}
                          disabled={togglingId === user._id || user.role === 'admin'}
                          title={user.role === 'admin' ? "Can't deactivate admin" : user.isActive !== false ? 'Deactivate user' : 'Activate user'}
                          className={`flex items-center gap-1.5 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                            user.isActive !== false
                              ? 'text-green-400 hover:text-red-400'
                              : 'text-red-400 hover:text-green-400'
                          }`}
                        >
                          {togglingId === user._id ? (
                            <div className="w-4 h-4 border border-current/30 border-t-current rounded-full animate-spin" />
                          ) : user.isActive !== false ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                          <span className="hidden sm:inline">
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
              <p className="text-xs text-dark-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-700 text-dark-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-700 text-dark-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
