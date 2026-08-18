import api, { unwrap } from './api'

export const orderService = {
  place: (shippingAddress, paymentMethod, notes) =>
    api.post('/orders', { shippingAddress, paymentMethod, notes }).then(unwrap).then((d) => d.order),

  myOrders: (params) =>
    api.get('/orders/my-orders', { params }).then((res) => ({
      orders: res.data.data,
      pagination: res.data.pagination,
    })),

  getOne: (id) => api.get(`/orders/${id}`).then(unwrap).then((d) => d.order),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }).then(unwrap),
}

export const paymentService = {
  getConfig: () => api.get('/payment/config').then(unwrap),
  createOrder: (orderId) => api.post('/payment/create-order', { orderId }).then(unwrap),
  verify: (payload) => api.post('/payment/verify', payload).then(unwrap),
  reportFailure: (orderId, error) => api.post('/payment/failure', { orderId, error }),
}
