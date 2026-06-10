import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Package, ChevronRight, ChevronLeft, ShoppingBag, Clock } from 'lucide-react';

const STATUS_STYLES = {
  pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/10  text-blue-400  border-blue-500/30',
  shipped:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/10  text-green-400  border-green-500/30',
  cancelled:  'bg-red-500/10   text-red-400    border-red-500/30',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 8;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/my-orders?page=${page}&limit=${LIMIT}`);
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            My <span className="gradient-text">Orders</span>
          </h1>
          <p className="text-dark-400 mt-1">{total} order{total !== 1 ? 's' : ''} placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-800 border border-dark-700 mb-5">
              <ShoppingBag className="w-8 h-8 text-dark-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
            <p className="text-dark-400 mb-6">Your order history will appear here.</p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusStyle =
                  STATUS_STYLES[order.status] || 'bg-dark-700 text-dark-300 border-dark-600';
                const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="glass-card p-5 flex items-center gap-4 hover:border-brand-500/30 transition-all group"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-brand-400" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-dark-400">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusStyle}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-white font-medium mt-1">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        {order.items?.[0]?.product?.name && (
                          <span className="text-dark-400 font-normal">
                            {' '}— {order.items[0].product.name}
                            {order.items.length > 1 && ` +${order.items.length - 1} more`}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-dark-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {date}
                        </span>
                      </div>
                    </div>

                    {/* Price + Arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-brand-400 font-bold">
                          ₹{order.totalAmount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-dark-500 capitalize">
                          {order.paymentMethod || 'Razorpay'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-brand-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-dark-700 bg-dark-800 text-dark-300 hover:text-white hover:border-brand-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && arr[i - 1] !== p - 1)
                      acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="text-dark-500 px-1">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          p === page
                            ? 'bg-brand-500 text-white border border-brand-500'
                            : 'border border-dark-700 bg-dark-800 text-dark-300 hover:text-white hover:border-brand-500/50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-dark-700 bg-dark-800 text-dark-300 hover:text-white hover:border-brand-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
