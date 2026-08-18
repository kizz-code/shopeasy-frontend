import api, { unwrap } from './api'

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then(unwrap),
  login: (email, password) => api.post('/auth/login', { email, password }).then(unwrap),
  getMe: () => api.get('/auth/me').then(unwrap),

  updateProfile: (payload) => api.put('/auth/profile', payload).then(unwrap),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then(unwrap),

  addAddress: (address) => api.post('/auth/address', address).then(unwrap),
  updateAddress: (id, address) => api.put(`/auth/address/${id}`, address).then(unwrap),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`).then(unwrap),
}
