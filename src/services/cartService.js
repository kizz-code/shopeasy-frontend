import api, { unwrap } from './api'

// Every cart endpoint returns the whole cart, so each of these can be used to
// replace the cart state outright.
const toCart = (data) => data.cart

export const cartService = {
  get: () => api.get('/cart').then(unwrap).then(toCart),
  add: (productId, quantity = 1) =>
    api.post('/cart/add', { productId, quantity }).then(unwrap).then(toCart),
  updateQuantity: (productId, quantity) =>
    api.put('/cart/update', { productId, quantity }).then(unwrap).then(toCart),
  remove: (productId) => api.delete(`/cart/remove/${productId}`).then(unwrap).then(toCart),
  clear: () => api.delete('/cart/clear').then(unwrap).then(toCart),
}
