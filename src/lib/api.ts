import { API_BASE_URL } from './config';

async function apiFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res.json();
}

export const api = {
  // Admin
  login: (phoneNumber: string, pin: string) =>
    apiFetch('/admin/login', { method: 'POST', body: JSON.stringify({ phoneNumber, pin }) }),

  createAdmin: (adminId: string, data: any) =>
    apiFetch('/admin/create', { method: 'POST', body: JSON.stringify({ adminId, ...data }) }),

  // Stats
  getStats: () => apiFetch('/admin/stats'),

  // Users
  getUsers: (params?: string) => apiFetch(`/admin/users${params ? `?${params}` : ''}`),
  getUser: (id: string) => apiFetch(`/admin/users/${id}`),
  updateUser: (id: string, data: any) =>
    apiFetch(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  verifyNanny: (id: string, approved: boolean) =>
    apiFetch(`/admin/users/${id}/verify-nanny`, { method: 'PUT', body: JSON.stringify({ approved }) }),
  deleteUser: (id: string) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
  toggleUserStatus: (id: string) =>
    apiFetch(`/admin/users/${id}/toggle-status`, { method: 'PUT' }),

  // Bookings
  getBookings: (params?: string) => apiFetch(`/admin/bookings${params ? `?${params}` : ''}`),
  getBooking: (id: string) => apiFetch(`/admin/bookings/${id}`),
  updateBookingStatus: (id: string, status: string, reason?: string) =>
    apiFetch(`/admin/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, reason }) }),

  // Reviews
  getReviews: (params?: string) => apiFetch(`/admin/reviews${params ? `?${params}` : ''}`),

  // Provider approvals (Daycare & Elder Care)
  getPendingDaycares: () => apiFetch('/providers/daycare/pending/list'),
  verifyDaycare: (id: string, status: 'approved' | 'rejected', rejectionReason?: string, adminEstimatedPrice?: number) =>
    apiFetch(`/providers/daycare/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason, adminEstimatedPrice }),
    }),
  getPendingElderCare: () => apiFetch('/providers/eldercare/pending/list'),
  verifyElderCare: (id: string, status: 'approved' | 'rejected', rejectionReason?: string, adminEstimatedPrice?: number) =>
    apiFetch(`/providers/eldercare/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason, adminEstimatedPrice }),
    }),
  getDaycareProviders: (params?: string) => apiFetch(`/providers/daycare${params ? `?${params}` : ''}`),
  getElderCareProviders: (params?: string) => apiFetch(`/providers/eldercare${params ? `?${params}` : ''}`),

  // Notifications
  sendNotification: (userId: string, title: string, body: string, data?: any) =>
    apiFetch('/notifications/send-to-user', {
      method: 'POST',
      body: JSON.stringify({ userId, title, body, data }),
    }),
  broadcastNotification: (title: string, body: string, role?: string) =>
    apiFetch(role ? '/notifications/send-to-role' : '/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, body, role }),
    }),
};
