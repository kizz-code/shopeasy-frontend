import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MapPin, CreditCard, ChevronLeft, XCircle, Check } from 'lucide-react'
import { orderService } from '../services/orderService'
import { formatPrice, formatDateTime } from '../utils/format'
import { statusConfig, TIMELINE } from '../utils/orderStatus'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    orderService
      .getOne(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const cancelOrder = async () => {
    if (!window.confirm('Cancel this order? The items will go back into stock.')) return

    setCancelling(true)
    try {
      const { order: updated } = await orderService.cancel(id, 'Changed my mind')
      setOrder(updated)
      toast.success('Order cancelled')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Order not found"
          message={error || 'This order does not exist or is not yours.'}
          actionLabel="Back to my orders"
          actionTo="/orders"
        />
      </div>
    )
  }

  const status = statusConfig(order.status)
  const StatusIcon = status.icon
  const isCancelled = order.status === 'cancelled'
  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const currentStep = TIMELINE.indexOf(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <Link to="/orders" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6">
        <ChevronLeft size={18} />
        Back to my orders
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Order {order.orderNumber}</h1>
          <p className="text-dark-400 text-sm mt-1">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${status.badge}`}>
          <StatusIcon size={14} />
          {status.label}
        </span>
      </header>

      {isCancelled ? (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
          <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium text-sm">This order was cancelled</p>
            {order.cancellationReason && (
              <p className="text-dark-400 text-xs mt-0.5">{order.cancellationReason}</p>
            )}
          </div>
        </div>
      ) : (
        <ol className="flex items-center mb-10">
          {TIMELINE.map((step, index) => {
            const config = statusConfig(step)
            const StepIcon = config.icon
            const done = index <= currentStep

            return (
              <li key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`w-9 h-9 rounded-full grid place-items-center border-2 transition-colors
                      ${done ? 'bg-brand-500 border-brand-500 text-white' : 'border-dark-600 text-dark-500'}`}
                  >
                    {index < currentStep ? <Check size={15} /> : <StepIcon size={15} />}
                  </span>
                  <span className={`text-[11px] ${done ? 'text-white' : 'text-dark-500'}`}>
                    {config.label}
                  </span>
                </div>
                {index < TIMELINE.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 ${index < currentStep ? 'bg-brand-500' : 'bg-dark-600'}`} />
                )}
              </li>
            )
          })}
        </ol>
      )}

      <section className="glass-card p-5 mb-4">
        <h2 className="font-bold text-white mb-4">Items</h2>
        <ul className="divide-y divide-dark-600">
          {order.items.map((item) => (
            <li key={item._id} className="flex gap-3 items-center py-3 first:pt-0 last:pb-0">
              <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover border border-dark-600" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product}`} className="text-white text-sm font-medium hover:text-brand-400 line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-dark-500 text-xs mt-0.5">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="text-white text-sm font-semibold">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <section className="glass-card p-5">
          <h2 className="font-bold text-white flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-brand-400" />
            Shipping address
          </h2>
          <p className="text-white text-sm font-medium">{order.shippingAddress?.name}</p>
          <p className="text-dark-400 text-sm mt-1">
            {order.shippingAddress?.street}, {order.shippingAddress?.city}
          </p>
          <p className="text-dark-400 text-sm">
            {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
          </p>
          <p className="text-dark-400 text-sm mt-1">{order.shippingAddress?.phone}</p>
        </section>

        <section className="glass-card p-5">
          <h2 className="font-bold text-white flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-brand-400" />
            Payment
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-dark-300">Subtotal</dt>
              <dd className="text-white">{formatPrice(order.pricing.itemsTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-dark-300">Shipping</dt>
              <dd className={order.pricing.shippingCharge === 0 ? 'text-green-400' : 'text-white'}>
                {order.pricing.shippingCharge === 0 ? 'Free' : formatPrice(order.pricing.shippingCharge)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-dark-300">GST</dt>
              <dd className="text-white">{formatPrice(order.pricing.taxAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-dark-600 pt-2 font-bold">
              <dt className="text-white">Total</dt>
              <dd className="text-brand-400">{formatPrice(order.pricing.grandTotal)}</dd>
            </div>
          </dl>
          <p className="text-dark-500 text-xs mt-3">
            {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'}
            {order.payment?.status && ` · ${order.payment.status}`}
          </p>
        </section>
      </div>

      {canCancel && (
        <button
          onClick={cancelOrder}
          disabled={cancelling}
          className="btn-secondary w-full text-red-400 hover:text-red-300 hover:border-red-500/40"
        >
          {cancelling ? 'Cancelling…' : 'Cancel this order'}
        </button>
      )}
    </div>
  )
}
