import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart2,
} from 'lucide-react';

const STATUS_STYLES = {
  pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/10  text-blue-400  border-blue-500/30',
  shipped:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/10  text-green-400  border-green-500/30',
  cancelled:  'bg-red-500/10   text-red-400    border-red-500/30',
};

function MiniBarChart({ data = [] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t-sm bg-brand-500/30 group-hover:bg-brand-500/60 transition-all duration-300"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-[9px] text-dark-600 hidden sm:block">{d.label}</span>
          {/* Tooltip */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-dark-700 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            ₹{d.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]           = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/orders?limit=5&sort=-createdAt'),
          api.get('/admin/dashboard/top-products'),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.orders || ordersRes.data || []);
        setTopProducts(productsRes.data.products || productsRes.data || []);
      } catch {
        // silently fail — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: stats?.revenueChange,
      color: 'brand',
    },
    {
      label: 'Total Orders',
      value: (stats?.totalOrders || 0).toLocaleString(),
      icon: ShoppingBag,
      change: stats?.ordersChange,
      color: 'blue',
    },
    {
      label: 'Total Users',
      value: (stats?.totalUsers || 0).toLocaleString(),
      icon: Users,
      change: stats?.usersChange,
      color: 'purple',
    },
    {
      label: 'Total Products',
      value: (stats?.totalProducts || 0).toLocaleString(),
      icon: Package,
      change: stats?.productsChange,
      color: 'green',
    },
  ];

  const colorMap = {
    brand:  { bg: 'bg-brand-500/10',  border: 'border-brand-500/20',  text: 'text-brand-400'  },
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400'   },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400'  },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-dark-400 mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            const c = colorMap[card.color];
            const isPositive = card.change >= 0;
            return (
              <div key={card.label} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  {card.change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(card.change)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-dark-400 text-sm mt-0.5">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-brand-400" />
                Revenue (Last 7 Months)
              </h2>
            </div>
            {stats?.revenueChart?.length ? (
              <MiniBarChart data={stats.revenueChart} />
            ) : (
              <div className="h-24 flex items-center justify-center text-dark-500 text-sm">
                No revenue data available
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-sm">Top Products</h2>
              <Link to="/admin/products" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {topProducts.length ? (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, i) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-dark-600 w-4">{i + 1}</span>
                    <img
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.name}
                      className="w-9 h-9 rounded-lg object-cover border border-dark-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium line-clamp-1">{product.name}</p>
                      <p className="text-dark-500 text-xs">{product.totalSold || 0} sold</p>
                    </div>
                    <p className="text-brand-400 text-xs font-semibold flex-shrink-0">
                      ₹{product.price?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-500 text-sm text-center py-6">No data available</p>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-400" />
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                      <th key={h} className="text-left pb-3 text-dark-500 font-medium text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="py-3 font-mono text-xs text-dark-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 text-white">
                        {order.user?.name || order.shippingAddress?.fullName || '—'}
                      </td>
                      <td className="py-3 text-dark-300">{order.items?.length || 0}</td>
                      <td className="py-3 text-brand-400 font-semibold">
                        ₹{order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${STATUS_STYLES[order.status] || 'bg-dark-700 text-dark-300 border-dark-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-dark-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-dark-500 text-sm text-center py-8">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
}
