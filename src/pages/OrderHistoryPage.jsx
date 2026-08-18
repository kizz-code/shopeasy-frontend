import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { orderService } from '../services/orderService'
import { formatPrice, formatDate } from '../utils/format'
import { statusConfig } from '../utils/orderStatus'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Pagination from '../components/common/Pagination'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    orderService
      .myOrders({ page, limit: 8 })
      .then((result) => {
        // The user may have paged again before this resolved; ignore stale answers.
        if (cancelled) return
        setOrders(result.orders)
        setPagination(result.pagination)
        setError(null)
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [page])

  if (loading) {
    return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          My <span className="gradient-text">Orders</span>
        </h1>
        <p className="text-dark-400 mt-1">
          {pagination?.totalItems || 0} order{pagination?.totalItems === 1 ? '' : 's'} placed
        </p>
      </header>

      {error ? (
        <EmptyState title="Could not load your orders" message={error} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          message="When you place an order it will show up here."
          actionLabel="Browse products"
          actionTo="/products"
        />
      ) : (
        <>
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id}>
                <OrderRow order={order} />
              </li>
            ))}
          </ul>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

function OrderRow({ order }) {
  const status = statusConfig(order.status)
  const StatusIcon = status.icon
  const extraItems = order.itemCount - 1

  return (
    <Link
      to={`/orders/${order._id}`}
      className="glass-card p-4 sm:p-5 flex items-center gap-4 hover:border-brand-500/40 transition-colors"
    >
      {order.firstItem?.image ? (
        <img
          src={order.firstItem.image}
          alt=""
          className="w-16 h-16 rounded-lg object-cover border border-dark-600 shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-dark-700 grid place-items-center shrink-0">
          <Package size={20} className="text-dark-500" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-mono text-xs text-dark-400">{order.orderNumber}</span>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${status.badge}`}>
            <StatusIcon size={11} />
            {status.label}
          </span>
        </div>

        <p className="text-white text-sm font-medium line-clamp-1">
          {order.firstItem?.name || 'Order'}
          {extraItems > 0 && <span className="text-dark-400"> + {extraItems} more</span>}
        </p>
        <p className="text-dark-500 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-white font-bold">{formatPrice(order.pricing.grandTotal)}</p>
        <p className="text-dark-500 text-xs uppercase">{order.paymentMethod}</p>
      </div>

      <ChevronRight size={18} className="text-dark-500 shrink-0 hidden sm:block" />
    </Link>
  )
}
