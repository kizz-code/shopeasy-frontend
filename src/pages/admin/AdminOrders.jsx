import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import { adminService } from '../../services/adminService'
import useDebounce from '../../hooks/useDebounce'
import { formatPrice, formatDate } from '../../utils/format'
import { statusConfig, NEXT_STATUS, ORDER_STATUSES } from '../../utils/orderStatus'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await adminService.orders({
        page,
        limit: 15,
        ...(status && { status }),
        ...(search.trim() && { search: search.trim() }),
      })
      setOrders(result.orders)
      setPagination(result.pagination)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [status, search])

  const changeStatus = async (order, nextStatus) => {
    setUpdatingId(order._id)
    try {
      const updated = await adminService.updateOrderStatus(order._id, nextStatus)
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? { ...o, status: updated.status } : o)))
      toast.success(`Order marked as ${nextStatus}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-dark-400 text-sm mt-1">
          {pagination?.totalItems ?? 0} order{pagination?.totalItems === 1 ? '' : 's'}
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order number…"
            aria-label="Search orders"
            className="input-field pl-10 text-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="input-field text-sm sm:w-52 cursor-pointer"
        >
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUSES).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <EmptyState title="Could not load orders" message={error} actionLabel="Retry" onAction={load} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" message="Nothing matches these filters." />
      ) : (
        <>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-dark-600 text-dark-400 text-xs uppercase tracking-wide">
                  <th className="text-left font-medium px-4 py-3">Order</th>
                  <th className="text-left font-medium px-4 py-3">Customer</th>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                  <th className="text-right font-medium px-4 py-3">Total</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Move to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {orders.map((order) => {
                  const config = statusConfig(order.status)
                  const nextOptions = NEXT_STATUS[order.status] || []

                  return (
                    <tr key={order._id} className="hover:bg-dark-700/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/orders/${order._id}`} className="font-mono text-xs text-brand-400 hover:text-brand-300">
                          {order.orderNumber}
                        </Link>
                        <p className="text-dark-500 text-xs mt-0.5">{order.items.length} item(s)</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white">{order.user?.name || 'Deleted user'}</p>
                        <p className="text-dark-500 text-xs">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-dark-300 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-semibold whitespace-nowrap">
                        {formatPrice(order.pricing.grandTotal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${config.badge}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {nextOptions.length === 0 ? (
                          <span className="text-dark-500 text-xs">—</span>
                        ) : (
                          <select
                            value=""
                            disabled={updatingId === order._id}
                            onChange={(e) => e.target.value && changeStatus(order, e.target.value)}
                            aria-label={`Change status of ${order.orderNumber}`}
                            className="bg-dark-700 border border-dark-600 rounded-lg px-2 py-1.5 text-xs text-white cursor-pointer disabled:opacity-50"
                          >
                            <option value="">Change…</option>
                            {nextOptions.map((next) => (
                              <option key={next} value={next}>{statusConfig(next).label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
