import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page')) || 1,
  })

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data.categories))
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      params.set('limit', '12')
      const res = await api.get(`/products?${params}`)
      setProducts(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
    // Sync filters to URL
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== '-createdAt') params.set(k, v) })
    setSearchParams(params, { replace: true })
  }, [filters, fetchProducts])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', featured: '', sort: '-createdAt', page: 1 })
  }

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.featured

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">All Products</h1>
        <p className="text-gray-400 text-sm">
          {pagination.totalItems ? `${pagination.totalItems} products found` : 'Explore our collection'}
        </p>
      </div>

      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Search products..."
            className="input-field pl-11"
          />
        </div>

        <div className="relative">
          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="input-field pr-10 appearance-none cursor-pointer min-w-[180px]"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn-secondary flex items-center gap-2 ${filtersOpen ? 'border-brand-500 text-brand-400' : ''}`}
        >
          <SlidersHorizontal size={17} />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
        </button>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <div className="glass-card p-6 mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Filter size={17} /> Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                <X size={14} /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Category</label>
              <select
                value={filters.category}
                onChange={e => updateFilter('category', e.target.value)}
                className="input-field text-sm appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Min Price (₹)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                placeholder="0"
                min="0"
                className="input-field text-sm"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Max Price (₹)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                placeholder="100000"
                min="0"
                className="input-field text-sm"
              />
            </div>

            {/* Featured */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Featured</label>
              <button
                onClick={() => updateFilter('featured', filters.featured === 'true' ? '' : 'true')}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                  ${filters.featured === 'true'
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                    : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-brand-500/30'}`}
              >
                {filters.featured === 'true' ? '✓ Featured Only' : 'Show Featured'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.search && (
            <span className="badge bg-dark-700 border border-dark-600 text-gray-300 text-xs gap-1.5">
              Search: "{filters.search}"
              <button onClick={() => updateFilter('search', '')} className="hover:text-red-400 transition-colors"><X size={12} /></button>
            </span>
          )}
          {filters.category && (
            <span className="badge bg-dark-700 border border-dark-600 text-gray-300 text-xs gap-1.5">
              {categories.find(c => c._id === filters.category)?.name || 'Category'}
              <button onClick={() => updateFilter('category', '')} className="hover:text-red-400 transition-colors"><X size={12} /></button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="badge bg-dark-700 border border-dark-600 text-gray-300 text-xs gap-1.5">
              ₹{filters.minPrice || '0'} – ₹{filters.maxPrice || '∞'}
              <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', '') }} className="hover:text-red-400 transition-colors"><X size={12} /></button>
            </span>
          )}
          {filters.featured && (
            <span className="badge bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs gap-1.5">
              Featured Only
              <button onClick={() => updateFilter('featured', '')} className="hover:text-red-400 transition-colors"><X size={12} /></button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32">
          <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-500" />
          </div>
          <h3 className="font-semibold text-white text-xl mb-2">No products found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => updateFilter('page', filters.page - 1)}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => updateFilter('page', page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200
                        ${filters.page === page
                          ? 'bg-brand-500 text-white'
                          : 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'}`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => updateFilter('page', filters.page + 1)}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
