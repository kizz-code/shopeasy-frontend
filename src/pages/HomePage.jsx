import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RotateCcw, Headphones, Zap } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹500' },
  { icon: Shield, title: 'Secure Payments', desc: 'Razorpay protected' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories'),
        ])
        setFeatured(featuredRes.data.data.products)
        setCategories(catRes.data.data.categories)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-brand-600/5 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
              <Zap size={14} className="text-brand-400" />
              <span className="text-brand-400 text-sm font-medium">New Arrivals Every Week</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Shop Smart,
              <br />
              <span className="gradient-text">Live Well.</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Discover premium products across electronics, fashion, home & more. 
              Curated quality, delivered fast.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary text-base py-3.5 px-8 flex items-center gap-2 group">
                Explore Products
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products?featured=true" className="btn-secondary text-base py-3.5 px-8">
                Featured Deals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-dark-600">
              {[
                { num: '10K+', label: 'Products' },
                { num: '50K+', label: 'Happy Customers' },
                { num: '4.9★', label: 'Avg Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white font-display">{stat.num}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y border-dark-600 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-500/20">
                  <Icon size={22} className="text-brand-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-gray-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-brand-400 text-sm font-medium uppercase tracking-widest mb-2">Browse</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Shop by Category</h2>
            </div>
            <Link to="/products" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1 transition-colors">
              All categories <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((cat) => (
              <Link key={cat._id} to={`/products?category=${cat._id}`}
                className="group glass-card p-6 text-center hover:border-brand-500/40 transition-all duration-300 hover:-translate-y-1">
                {cat.image && (
                  <img src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                )}
                <p className="font-semibold text-white text-sm group-hover:text-brand-400 transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-brand-400 text-sm font-medium uppercase tracking-widest mb-2">Hand-Picked</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Featured Products</h2>
          </div>
          <Link to="/products?featured=true" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/products" className="btn-secondary text-base py-3.5 px-8 inline-flex items-center gap-2">
            Browse All Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-dark-800 border-y border-dark-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start shopping?
          </h2>
          <p className="text-gray-400 mb-8">Join thousands of happy customers. Sign up and get ₹200 off your first order.</p>
          <Link to="/register" className="btn-primary text-base py-3.5 px-10">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
