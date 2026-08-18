import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react'
import { productService, categoryService } from '../../services/productService'
import useDebounce from '../../hooks/useDebounce'
import { formatPrice, primaryImage } from '../../utils/format'
import ProductImage from '../../components/common/ProductImage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'

const blankProduct = {
  name: '', description: '', price: '', discountedPrice: '',
  category: '', brand: '', stock: '', imageUrl: '', isFeatured: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await productService.list({
        page, limit: 12, ...(search.trim() && { search: search.trim() }),
      })
      setProducts(result.products)
      setPagination(result.pagination)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  const remove = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the store?`)) return
    try {
      await productService.remove(product._id)
      toast.success('Product removed')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-dark-400 text-sm mt-1">{pagination?.totalItems ?? 0} live products</p>
        </div>
        <button onClick={() => setEditing({ ...blankProduct })} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New product
        </button>
      </header>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="input-field pl-10 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" message="Try a different search, or add a new product." />
      ) : (
        <>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-dark-600 text-dark-400 text-xs uppercase tracking-wide">
                  <th className="text-left font-medium px-4 py-3">Product</th>
                  <th className="text-left font-medium px-4 py-3">Category</th>
                  <th className="text-right font-medium px-4 py-3">Price</th>
                  <th className="text-right font-medium px-4 py-3">Stock</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={primaryImage(product)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-dark-600 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white line-clamp-1">{product.name}</p>
                          <p className="text-dark-500 text-xs">{product.brand || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-300">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-white">
                        {formatPrice(product.discountedPrice > 0 ? product.discountedPrice : product.price)}
                      </span>
                      {product.discountedPrice > 0 && (
                        <span className="block text-dark-500 text-xs line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-amber-400' : 'text-dark-300'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(toFormValues(product))}
                          aria-label={`Edit ${product.name}`}
                          className="p-2 text-dark-400 hover:text-brand-400 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => remove(product)}
                          aria-label={`Delete ${product.name}`}
                          className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {editing && (
        <ProductForm
          initial={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

// The form works with plain strings and a single image URL; this flattens a product
// from the API into that shape.
function toFormValues(product) {
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: String(product.price),
    discountedPrice: product.discountedPrice ? String(product.discountedPrice) : '',
    category: product.category?._id || '',
    brand: product.brand || '',
    stock: String(product.stock),
    imageUrl: primaryImage(product),
    isFeatured: product.isFeatured,
  }
}

function ProductForm({ initial, categories, onClose, onSaved }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFieldErrors({})

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : 0,
      category: form.category,
      brand: form.brand,
      stock: Number(form.stock),
      isFeatured: form.isFeatured,
      images: form.imageUrl ? [{ url: form.imageUrl, alt: form.name, isPrimary: true }] : [],
    }

    try {
      if (form._id) {
        await productService.update(form._id, payload)
        toast.success('Product updated')
      } else {
        await productService.create(payload)
        toast.success('Product created')
      }
      onSaved()
    } catch (error) {
      // The API returns per-field messages for validation failures; show them
      // next to the inputs rather than in a toast.
      if (error.errors) {
        setFieldErrors(Object.fromEntries(error.errors.map((e) => [e.field, e.message])))
      }
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <h2 className="font-bold text-white text-lg">
            {form._id ? 'Edit product' : 'New product'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-dark-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <FormField label="Name" error={fieldErrors.name}>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" required />
          </FormField>

          <FormField label="Description" error={fieldErrors.description}>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="input-field resize-y"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Category" error={fieldErrors.category}>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field cursor-pointer" required>
                <option value="">Choose a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Brand">
              <input value={form.brand} onChange={(e) => set('brand', e.target.value)} className="input-field" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Price (₹)" error={fieldErrors.price}>
              <input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className="input-field" required />
            </FormField>

            <FormField label="Sale price (₹)" error={fieldErrors.discountedPrice}>
              <input type="number" min="0" value={form.discountedPrice} onChange={(e) => set('discountedPrice', e.target.value)} className="input-field" placeholder="Optional" />
            </FormField>

            <FormField label="Stock" error={fieldErrors.stock}>
              <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input-field" required />
            </FormField>
          </div>

          <FormField label="Image URL">
            <input
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              className="input-field"
              placeholder="https://…"
            />
            <ImagePreview url={form.imageUrl} />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="accent-brand-500 w-4 h-4"
            />
            Show on the homepage
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : form._id ? 'Save changes' : 'Create product'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Loads the pasted URL and reports what happened.
 *
 * The usual mistake is pasting the page a photo sits on rather than the photo
 * itself - an Unsplash photo page instead of the images.unsplash.com file. Both
 * look like a link, but only one is an image. Showing the result while the form
 * is still open means that gets caught before the product is saved.
 */
function ImagePreview({ url }) {
  const trimmed = url?.trim()
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!trimmed) {
      setStatus('idle')
      return
    }
    setStatus('loading')

    // Loading it in a detached Image is the only reliable way to know whether a
    // URL really resolves to an image; a HEAD request would be blocked by CORS.
    const img = new Image()
    let cancelled = false
    img.onload = () => !cancelled && setStatus('ok')
    img.onerror = () => !cancelled && setStatus('error')
    img.src = trimmed

    return () => { cancelled = true }
  }, [trimmed])

  if (status === 'idle') {
    return (
      <p className="text-dark-500 text-xs mt-1.5">
        Paste a direct link to an image file, not the page it appears on.
      </p>
    )
  }

  if (status === 'loading') {
    return <p className="text-dark-400 text-xs mt-1.5">Checking image…</p>
  }

  if (status === 'error') {
    return (
      <p className="text-amber-400 text-xs mt-1.5">
        That link did not load as an image. It is usually the page the photo sits on
        rather than the file itself — open the image directly and copy that URL.
      </p>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <img src={trimmed} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-dark-600" />
      <span className="text-green-400 text-xs">Image loads correctly</span>
    </div>
  )
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
