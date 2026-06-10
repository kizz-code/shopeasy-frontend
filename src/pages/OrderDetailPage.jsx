import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  XCircle,
  ChevronLeft,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TIMELINE_STEPS = [
  { status: 'pending',    label: 'Order Placed',   icon: Clock,         color: 'yellow' },
  { status: 'processing', label: 'Processing',     icon: Package,       color: 'blue'   },
  { status: 'shipped',    label: 'Shipped',        icon: Truck,         color: 'purple' },
  { status: 'delivered',  label: 'Delivered',      icon: Home,          color: 'green'  },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_STYLES = {
  pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/10  text-blue-400  border-blue-500/30',
  shipped:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/10  text-green-400  border-green-500/30',
  cancelled:  'bg-red-500/10   text-red-400    border-red-500/30',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order || data);
      } catch {
        toast.error('Could not load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400 mb-4">Order not found.</p>
          <Link to="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-dark-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back + Success Banner */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {location.state?.success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-medium">Payment Successful!</p>
              <p className="text-green-400/70 text-sm">Your order has been placed and confirmed.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Order <span className="gradient-text">Details</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-dark-400">
                #{order._id?.slice(-8).toUpperCase() || id.slice(-8).toUpperCase()}
              </span>
              <button
                onClick={copyOrderId}
                className="text-dark-600 hover:text-brand-400 transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full border font-medium capitalize ${
              STATUS_STYLES[order.status] || 'bg-dark-700 text-dark-300 border-dark-600'
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-bold text-white mb-6">Order Status</h2>
          {isCancelled ? (
            <div className="flex items-center gap-3 text-red-400">
              <XCircle className="w-6 h-6" />
              <div>
                <p className="font-medium">Order Cancelled</p>
                {order.cancelReason && (
                  <p className="text-sm text-dark-400 mt-0.5">Reason: {order.cancelReason}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              {TIMELINE_STEPS.map((step, i) => {
                const isCompleted = i <= currentStatusIndex;
                const isCurrent  = i === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? `bg-${step.color}-500/20 border-${step.color}-500 text-${step.color}-400`
                            : 'bg-dark-800 border-dark-600 text-dark-600'
                        } ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-dark-800 ring-brand-500/50' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs mt-2 text-center hidden sm:block ${
                          isCompleted ? 'text-white' : 'text-dark-600'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 mb-5 ${
                          i < currentStatusIndex ? 'bg-brand-500' : 'bg-dark-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="glass-card p-5">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-dark-300 space-y-0.5">
                <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-dark-400">📞 {order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-dark-500 text-sm">No address information</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="glass-card p-5">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" />
              Payment Details
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-dark-400">Method</span>
                <span className="text-white capitalize">
                  {order.paymentMethod || 'Razorpay'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Status</span>
                <span
                  className={`capitalize ${
                    order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Payment ID</span>
                  <span className="text-white font-mono text-xs">{order.paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-dark-400">Date</span>
                <span className="text-white">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="glass-card p-5 mb-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" />
            Items Ordered
          </h2>
          <div className="space-y-4">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <img
                  src={item.product?.images?.[0] || '/placeholder.png'}
                  alt={item.product?.name || 'Product'}
                  className="w-16 h-16 rounded-xl object-cover border border-dark-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium line-clamp-1">
                    {item.product?.name || 'Product'}
                  </p>
                  <p className="text-dark-400 text-sm mt-0.5">
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                  </p>
                </div>
                <p className="text-brand-400 font-bold flex-shrink-0">
                  ₹{(item.quantity * item.price)?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-dark-700 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-dark-400">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toLocaleString() || '—'}</span>
            </div>
            <div className="flex justify-between text-dark-400">
              <span>Shipping</span>
              <span>
                {order.shippingCost === 0 ? (
                  <span className="text-green-400">Free</span>
                ) : (
                  `₹${order.shippingCost?.toLocaleString() || '—'}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-dark-400">
              <span>Tax</span>
              <span>₹{order.tax?.toLocaleString() || '—'}</span>
            </div>
            <div className="flex justify-between font-bold text-white text-base pt-1 border-t border-dark-700">
              <span>Total</span>
              <span className="text-brand-400">₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/orders" className="btn-secondary">
            View All Orders
          </Link>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
