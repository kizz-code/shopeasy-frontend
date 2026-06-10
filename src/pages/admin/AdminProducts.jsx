import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit2, Trash2, X, Image as ImageIcon,
  ChevronLeft, ChevronRight, Package,
} from 'lucide-react';

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: '', brand: '', stock: '', images: [''],
  isFeatured: false,
};

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? { ...product, images: product.images?.length ? product.images : [''] } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      toast.error('Name, price, and stock are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        images: form.images.filter(Boolean),
      };
      if (product?._id) {
        const { data } = await api.put(`/products/${product._id}`, payload);
        onSave(data.product || data, 'edit');
      } else {
        const { data } = await api.post('/products', payload);
        onSave(data.product || data, 'create');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const addImageField = () => setForm({ ...form, images: [...form.images, ''] });
  const updateImage  = (i, v) => {
    const imgs = [...form.images];
    imgs[i] = v;
    setForm({ ...form, images: imgs });
  };
  const removeImage  = (i) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-dark-700 sticky top-0 bg-dark-800 z-10">
          <h2 className="text-lg font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-dark-400 mb-1.5">Product Name *</label>
              <input type="text" className="input-field w-full" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1.5">Price (₹) *</label>
              <input type="number" className="input-field w-full" value={form.price} min={0}
                onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="999" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1.5">Original Price (₹)</label>
              <input type="number" className="input-field w-full" value={form.originalPrice} min={0}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="1299" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1.5">Category</label>
              <input type="text" className="input-field w-full" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Electronics" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1.5">Brand</label>
              <input type="text" className="input-field w-full" value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Apple" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1.5">Stock *</label>
              <input type="number" className="input-field w-full" value={form.stock} min={0}
                onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="100" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-brand-500" />
                <span className="text-sm text-dark-300">Featured Product</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1.5">Description</label>
            <textarea className="input-field w-full resize-none" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..." />
          </div>

          {/* Image URLs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-dark-400">Image URLs</label>
              <button type="button" onClick={addImageField}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded border border-dark-700 bg-dark-800 flex-shrink-0 overflow-hidden">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-dark-600" />
                      </div>
                    )}
                  </div>
                  <input type="url" className="input-field flex-1 text-sm" value={img}
                    onChange={(e) => updateImage(i, e.target.value)}
                    placeholder="https://example.com/image.jpg" />
                  {form.images.length > 1 && (
                    <button type="button" onClick={() => removeImage(i)}
                      className="text-dark-500 hover:text-red-400 transition-colors p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {product ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined=closed, null=new, obj=edit
  const LIMIT = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/products?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`
      );
      setProducts(data.products || data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  const handleSave = (saved, action) => {
    toast.success(action === 'create' ? 'Product created!' : 'Product updated!');
    setModalProduct(undefined);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="gradient-text">Products</span> Management
            </h1>
            <p className="text-dark-400 text-sm mt-0.5">Manage your product catalogue</p>
          </div>
          <button onClick={() => setModalProduct(null)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input type="text" className="input-field w-full pl-9 text-sm" placeholder="Search products..."
            value={search} onChange={handleSearch} />
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-dark-500">
              <Package className="w-10 h-10 mb-3" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-800/50">
                    {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || '/placeholder.png'} alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-dark-700 flex-shrink-0" />
                          <div>
                            <p className="text-white font-medium line-clamp-1 max-w-[180px]">{p.name}</p>
                            <p className="text-dark-500 text-xs">{p.brand || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge text-xs">{p.category || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-brand-400 font-semibold">₹{p.price?.toLocaleString()}</p>
                        {p.originalPrice > p.price && (
                          <p className="text-dark-600 text-xs line-through">₹{p.originalPrice?.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${p.stock > 10 ? 'text-green-400' : p.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {p.stock > 0 ? p.stock : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${p.isFeatured ? 'text-brand-400' : 'text-dark-600'}`}>
                          {p.isFeatured ? '★ Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setModalProduct(p)}
                            className="p-1.5 text-dark-400 hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-500/10">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            className="p-1.5 text-dark-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
              <p className="text-xs text-dark-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-700 text-dark-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-700 text-dark-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {modalProduct !== undefined && (
          <ProductModal
            product={modalProduct}
            onClose={() => setModalProduct(undefined)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
