import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productService, categoryService } from '../services/productService'
import useDebounce from '../hooks/useDebounce'
import ProductCard from '../components/product/ProductCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name (A–Z)' },
]

const PER_PAGE = 12

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // What the user has typed. Kept separate from the committed filters so the input
  // stays responsive while we wait out the debounce.
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchInput, 400)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || '',
    sort: searchParams.get('sort') || 'newest',
  })
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  // Changing a filter or the search term should always send you back to page 1 -
  // being on page 4 of the old results is meaningless once the results change.
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const clearFilters = () => {
    setSearchInput('')
    setFilters({ category: '', minPrice: '', maxPrice: '', featured: '', sort: 'newest' })
    setPage(1)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: PER_PAGE, sort: filters.sort }
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
      if (filters.category) params.category = filters.category
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.featured) params.featured = filters.featured

      const result = await productService.list(params)
      setProducts(result.products)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filters, page])

  useEffect(() => {
    load()
  }, [load])

  // Mirror the current view into the URL so a filtered list can be bookmarked
  // or shared, and so the back button behaves.
  useEffect(() => {
    const params = {}
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    Object.entries(filters).forEach(([k, v]) => {
      if (v && !(k === 'sort' && v === 'newest')) params[k] = v
    })
    if (page > 1) params.page = String(page)
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, filters, page, setSearchParams])

  const categoryName = categories.find((c) => c._id === filters.category)?.name

  const activeFilterCount = [
    debouncedSearch.trim(),
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.featured,
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* The heading names the category when one is selected, so arriving from a
          category link clearly lands you on a filtered page. */}
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">
          {categoryName || 'All Products'}
        </h1>
        <p className="text-dark-400 text-sm">
          {loading
            ? 'Loading…'
            : pagination?.totalItems
              ? `${pagination.totalItems} product${pagination.totalItems === 1 ? '' : 's'} found`
              : 'Explore our collection'}
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="input-field pl-11"
          />
        </div>

        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            aria-label="Sort products"
            className="input-field pr-10 appearance-none cursor-pointer w-full sm:min-w-[190px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
        </div>

        <button
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className={`btn-secondary flex items-center justify-center gap-2 ${filtersOpen ? 'border-brand-500/50 text-brand-400' : ''}`}
        >
          <SlidersHorizontal size={17} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-brand-500 text-white text-xs w-5 h-5 rounded-full grid place-items-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="glass-card p-5 sm:p-6 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filter-category" className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wide">
                Category
              </label>
              <select
                id="filter-category"
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="input-field text-sm appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-min" className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wide">
                Min Price (₹)
              </label>
              <input
                id="filter-min"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                placeholder="0"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label htmlFor="filter-max" className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wide">
                Max Price (₹)
              </label>
              <input
                id="filter-max"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                placeholder="Any"
                className="input-field text-sm"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wide">Featured</span>
              <button
                onClick={() => updateFilter('featured', filters.featured === 'true' ? '' : 'true')}
                aria-pressed={filters.featured === 'true'}
                className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors
                  ${filters.featured === 'true'
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                    : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-brand-500/30'}`}
              >
                {filters.featured === 'true' ? 'Featured only' : 'Show featured'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {debouncedSearch.trim() && (
            <FilterChip label={`“${debouncedSearch.trim()}”`} onClear={() => setSearchInput('')} />
          )}
          {filters.category && (
            <FilterChip label={categoryName || 'Category'} onClear={() => updateFilter('category', '')} />
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <FilterChip
              label={`₹${filters.minPrice || '0'} – ₹${filters.maxPrice || 'any'}`}
              onClear={() => {
                setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' }))
                setPage(1)
              }}
            />
          )}
          {filters.featured && (
            <FilterChip label="Featured only" onClear={() => updateFilter('featured', '')} />
          )}
          <button onClick={clearFilters} className="text-xs text-dark-400 hover:text-brand-400 underline underline-offset-2">
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <EmptyState
          title="Could not load products"
          message={error}
          actionLabel="Try again"
          onAction={load}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No products found"
          message="Nothing matched your search or filters. Try widening them."
          actionLabel={activeFilterCount > 0 ? 'Clear filters' : undefined}
          onAction={activeFilterCount > 0 ? clearFilters : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}
    </div>
  )
}

function FilterChip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-dark-700 border border-dark-600 text-dark-200 text-xs px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onClear} aria-label={`Remove filter ${label}`} className="hover:text-red-400 transition-colors">
        <X size={12} />
      </button>
    </span>
  )
}
