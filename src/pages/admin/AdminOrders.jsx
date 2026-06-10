import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Search, ChevronLeft, ChevronRight,
  ShoppingBag, ExternalLink, Filter,
} from 'lucide-react';

const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/10  text-blue-400  border-blue-500/30',
  shipped:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/10  text-green-400  border-green-500/30',
  cancelled:  'bg-red-500/10   text-red-400    border-red-500/30',
};

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const LIMIT = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sort: '-createdAt',
      });
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders || data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order status updated to "${newStatus}".`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            <span className="gradient-text">Orders</span> Management
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">{total} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              className="input-field pl-9 text-sm w-56"
              placeholder="Search by order ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="relative flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-dark-500" />
            <select
              className="input-field text-sm pr-8 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-dark-800 capitalize">
                  {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-dark-500">
              <ShoppingBag className="w-10 h-10 mb-3" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-800/50">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-dark-400">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white text-xs font-medium">
                            {order.user?.name || order.shippingAddress?.fullName || '—'}
                          </p>
                          <p className="text-dark-500 text-xs">{order.user?.email || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark-300 text-xs">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-brand-400 font-semibold">
                          ₹{order.totalAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs capitalize ${
                          order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {order.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={order.status}
                            disabled={updatingId === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border font-medium capitalize cursor-pointer bg-transparent appearance-none pr-5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${
                              STATUS_STYLES[order.status] || 'bg-dark-700 text-dark-300 border-dark-600'
                            }`}
                          >
                            {ALL_STATUSES.filter((s) => s !== 'all').map((s) => (
                              <option key={s} value={s} className="bg-dark-800 text-white capitalize">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          {updatingId === order._id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark-500 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/orders/${order._id}`}
                          className="p-1.5 text-dark-400 hover:text-brand-400 transition-colors inline-flex rounded-lg hover:bg-brand-500/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
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
