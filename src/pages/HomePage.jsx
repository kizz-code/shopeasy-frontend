import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RotateCcw, Headphones, Search } from 'lucide-react'
import { productService, categoryService } from '../services/productService'
import ProductCard from '../components/product/ProductCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹500' },
  { icon: Shield, title: 'Secure Checkout', desc: 'Your data stays yours' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [catalogueSize, setCatalogueSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heroSearch, setHeroSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // limit=1 because we only want the total out of the pagination block,
        // not the products themselves.
        const [featuredProducts, categoryList, page] = await Promise.all([
          productService.getFeatured(),
          categoryService.list(),
          productService.list({ limit: 1 }),
        ])
        setFeatured(featuredProducts)
        setCategories(categoryList)
        setCatalogueSize(page.pagination.totalItems)
      } catch {
        // The hero and category strip still render; the grid just stays empty.
        setFeatured([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Find it fast.
              <br />
              <span className="gradient-text">Buy it simply.</span>
            </h1>

            {/* The counts come from the API rather than being written into the copy,
                so the page cannot claim a catalogue it does not have. */}
            <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {catalogueSize
                ? `Search ${catalogueSize} products across ${categories.length} categories.`
                : 'Search the catalogue by name, brand or category.'}{' '}
              Filter by price, sort how you like, and check out in two steps.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = heroSearch.trim()
                navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="search"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Try headphones, Nike or Atomic Habits"
                  aria-label="Search the catalogue"
                  className="input-field pl-12 py-4 text-base"
                />
              </div>
              <button
                type="submit"
                className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                Search
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm">
              <span className="text-dark-500">Popular:</span>
              {['Headphones', 'Sneakers', 'Books'].map((term) => (
                <Link
                  key={term}
                  to={`/products?search=${encodeURIComponent(term)}`}
                  className="text-dark-300 hover:text-brand-400 underline underline-offset-4 decoration-dark-600 hover:decoration-brand-400 transition-colors"
                >
                  {term}
                </Link>
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
                  <p className="text-dark-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Every category is shown below, so this header needs no "see all" link. */}
          <div className="mb-10">
            <p className="text-brand-400 text-sm font-medium uppercase tracking-widest mb-2">Browse</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>

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
          <p className="text-dark-400 mb-8">Create an account to save your cart and track your orders.</p>
          <Link to="/register" className="btn-primary text-base py-3.5 px-10">
            Create an account
          </Link>
        </div>
      </section>
    </div>
  )
}
