import api, { unwrap } from './api'

export const adminService = {
  dashboard: () => api.get('/admin/dashboard').then(unwrap),

  users: (params) =>
    api.get('/admin/users', { params }).then((res) => ({
      users: res.data.data,
      pagination: res.data.pagination,
    })),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`).then(unwrap),

  orders: (params) =>
    api.get('/orders/admin/all', { params }).then((res) => ({
      orders: res.data.data,
      pagination: res.data.pagination,
    })),
  updateOrderStatus: (id, status, note) =>
    api.put(`/orders/${id}/status`, { status, note }).then(unwrap).then((d) => d.order),
}
