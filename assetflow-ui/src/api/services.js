import api from './axios'

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: (token) => api.post(`/auth/refresh-token?token=${token}`),
}

export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  promote: (id) => api.put(`/employees/${id}/promote`),
}

export const departmentApi = {
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  getHierarchy: () => api.get('/departments/hierarchy'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  setHead: (id, userId) => api.put(`/departments/${id}/head?userId=${userId}`),
}

export const categoryApi = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const assetApi = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  uploadImage: (id, formData, isPrimary) => api.post(
    `/assets/${id}/images?isPrimary=${isPrimary}`,
    formData, { headers: { 'Content-Type': 'multipart/form-data' } }
  ),
  deleteImage: (id, imageId) => api.delete(`/assets/${id}/images/${imageId}`),
  uploadDocument: (id, formData) => api.post(
    `/assets/${id}/documents`,
    formData, { headers: { 'Content-Type': 'multipart/form-data' } }
  ),
  deleteDocument: (id, docId) => api.delete(`/assets/${id}/documents/${docId}`),
  getQr: (id) => api.get(`/assets/${id}/qr`),
  regenerateQr: (id) => api.post(`/assets/${id}/qr/regenerate`),
}

export const allocationApi = {
  getAll: (params) => api.get('/allocations', { params }),
  getById: (id) => api.get(`/allocations/${id}`),
  allocate: (data) => api.post('/allocations', data),
  return: (id, data) => api.post(`/allocations/${id}/return`, data),
  transfer: (id, data) => api.post(`/allocations/${id}/transfer`, data),
  uploadPhoto: (id, formData, photoType) => api.post(
    `/allocations/${id}/photos?photoType=${photoType}`,
    formData, { headers: { 'Content-Type': 'multipart/form-data' } }
  ),
}

export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id, reason) => api.delete(`/bookings/${id}?reason=${reason || ''}`),
  getCalendar: (resourceId, year, month) => api.get('/bookings/calendar', { params: { resourceId, year, month } }),
  getResources: (type) => api.get('/bookable-resources', { params: type ? { type } : {} }),
  createResource: (data) => api.post('/bookable-resources', data),
}

export const maintenanceApi = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  updateStatus: (id, data) => api.put(`/maintenance/${id}/status`, data),
  assign: (id, technicianId) => api.put(`/maintenance/${id}/assign?technicianId=${technicianId}`),
}

export const auditApi = {
  getAll: (params) => api.get('/audits', { params }),
  getById: (id) => api.get(`/audits/${id}`),
  create: (data) => api.post('/audits', data),
  createAssignment: (id, data) => api.post(`/audits/${id}/assignments`, data),
  getAssignments: (id) => api.get(`/audits/${id}/assignments`),
  close: (id) => api.put(`/audits/${id}/close`),
  verifyItem: (itemId, data) => api.post(`/audit-items/${itemId}/verify`, data),
  getDiscrepancyReport: (id) => api.get(`/audits/${id}/discrepancy-report`),
}

export const activityLogApi = {
  getAll: (params) => api.get('/activity-logs', { params }),
}


export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getDeptDistribution: () => api.get('/dashboard/department-distribution'),
  getAssetStatus: () => api.get('/dashboard/asset-status'),
  getMaintenanceTrends: () => api.get('/dashboard/maintenance-trends'),
  getExpiringWarranties: () => api.get('/dashboard/expiring-warranties'),
  getUpcomingReturns: () => api.get('/dashboard/upcoming-returns'),
}

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
}

export const reportApi = {
  downloadAssets: (format, params) => api.get('/reports/assets', { params: { format, ...params }, responseType: 'blob' }),
  downloadAllocations: (format, params) => api.get('/reports/allocations', { params: { format, ...params }, responseType: 'blob' }),
  downloadMaintenance: (format, params) => api.get('/reports/maintenance', { params: { format, ...params }, responseType: 'blob' }),
  downloadBookings: (format, params) => api.get('/reports/bookings', { params: { format, ...params }, responseType: 'blob' }),
  downloadWarranty: (format, params) => api.get('/reports/warranty', { params: { format, ...params }, responseType: 'blob' }),
}

export const searchApi = {
  search: (q, types) => api.get('/search', { params: { q, types } }),
}
