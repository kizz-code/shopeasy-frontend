import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IndianRupee, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatPrice, formatDate } from '../../utils/format'
import { statusConfig } from '../../utils/orderStatus'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    adminService
      .dashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>
  if (error) return <EmptyState title="Could not load the dashboard" message={error} />

  const { overview, recentOrders, topProducts, revenueTrend } = data

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1">How the store is doing.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total revenue" value={formatPrice(overview.totalRevenue)} />
        <StatCard icon={ShoppingBag} label="Orders" value={overview.totalOrders} />
        <StatCard icon={Users} label="Customers" value={overview.totalUsers} />
        <StatCard icon={Package} label="Products live" value={overview.totalProducts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniStat label="Last 7 days" revenue={overview.last7Days?.revenue} orders={overview.last7Days?.orders} />
        <MiniStat label="Last 30 days" revenue={overview.last30Days?.revenue} orders={overview.last30Days?.orders} />
        <div className="glass-card p-5">
          <p className="text-dark-400 text-xs uppercase tracking-wide mb-1">Average order</p>
          <p className="text-xl font-bold text-white">{formatPrice(overview.avgOrderValue)}</p>
        </div>
      </div>

      {revenueTrend?.length > 0 && <RevenueChart trend={revenueTrend} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-brand-400 hover:text-brand-300">View all</Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-dark-400 text-sm py-4">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-dark-600">
              {recentOrders.map((order) => {
                const status = statusConfig(order.status)
                return (
                  <li key={order._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{order.user?.name || 'Deleted user'}</p>
                      <p className="text-dark-500 text-xs font-mono">{order.orderNumber}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${status.badge}`}>
                      {status.label}
                    </span>
                    <span className="text-white text-sm font-semibold w-24 text-right">
                      {formatPrice(order.pricing.grandTotal)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="glass-card p-5">
          <h2 className="font-bold text-white mb-4">Best sellers</h2>

          {topProducts.length === 0 ? (
            <p className="text-dark-400 text-sm py-4">Nothing sold yet.</p>
          ) : (
            <ul className="divide-y divide-dark-600">
              {topProducts.map((product, index) => (
                <li key={product._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-dark-500 text-sm font-mono w-5">{index + 1}</span>
                  {product.image && (
                    <img src={product.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-dark-600" />
                  )}
                  <p className="flex-1 min-w-0 text-white text-sm line-clamp-1">{product.name}</p>
                  <span className="text-dark-300 text-xs whitespace-nowrap">{product.totalSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-card p-5">
      <Icon size={18} className="text-brand-400 mb-3" />
      <p className="text-dark-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}

function MiniStat({ label, revenue = 0, orders = 0 }) {
  return (
    <div className="glass-card p-5">
      <p className="text-dark-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{formatPrice(revenue)}</p>
      <p className="text-dark-500 text-xs mt-0.5">{orders} order{orders === 1 ? '' : 's'}</p>
    </div>
  )
}

// A plain CSS bar chart. A charting library would be a lot of bundle size for
// seven bars.
function RevenueChart({ trend }) {
  const max = Math.max(...trend.map((d) => d.revenue), 1)

  return (
    <section className="glass-card p-5">
      <h2 className="font-bold text-white flex items-center gap-2 mb-5">
        <TrendingUp size={17} className="text-brand-400" />
        Revenue, last 7 days
      </h2>

      {/* justify-center keeps a single day from stretching across the whole card */}
      <div className="flex items-end justify-center gap-3">
        {trend.map((day) => (
          <div key={day._id} className="flex-1 max-w-[90px] flex flex-col items-center gap-2 min-w-0">
            <span className="text-[10px] text-dark-400">{formatPrice(day.revenue)}</span>
            {/* The bar is sized against this fixed-height track, not against the
                column, which has no height of its own to be a percentage of. */}
            <div className="w-full h-32 flex items-end">
              <div
                className="w-full bg-brand-500/70 hover:bg-brand-500 rounded-t transition-colors"
                style={{ height: `${Math.max((day.revenue / max) * 100, 3)}%` }}
                title={`${day._id}: ${formatPrice(day.revenue)}`}
              />
            </div>
            <span className="text-[10px] text-dark-500 truncate w-full text-center">
              {formatDate(day._id).replace(/ \d{4}$/, '')}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
