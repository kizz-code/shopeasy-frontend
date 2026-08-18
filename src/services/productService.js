import api, { unwrap } from './api'

export const productService = {
  // The full axios response is needed here, because the product list carries its
  // pagination outside of `data`.
  list: (params) =>
    api.get('/products', { params }).then((res) => ({
      products: res.data.data,
      pagination: res.data.pagination,
    })),

  getOne: (identifier) => api.get(`/products/${identifier}`).then(unwrap).then((d) => d.product),
  getFeatured: () => api.get('/products/featured').then(unwrap).then((d) => d.products),

  create: (payload) => api.post('/products', payload).then(unwrap).then((d) => d.product),
  update: (id, payload) => api.put(`/products/${id}`, payload).then(unwrap).then((d) => d.product),
  remove: (id) => api.delete(`/products/${id}`),

  addReview: (id, rating, comment) =>
    api.post(`/products/${id}/reviews`, { rating, comment }).then(unwrap),
}

export const categoryService = {
  list: () => api.get('/categories').then(unwrap).then((d) => d.categories),
  create: (payload) => api.post('/categories', payload).then(unwrap),
}
