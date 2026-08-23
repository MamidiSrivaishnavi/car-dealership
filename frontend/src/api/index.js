import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-clear stale auth on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const vehiclesAPI = {
  list: () => api.get('/vehicles'),
  search: (params) => api.get('/vehicles/search', { params }),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  remove: (id) => api.delete(`/vehicles/${id}`),
  purchase: (id) => api.post(`/vehicles/${id}/purchase`),
  restock: (id, quantity) => api.post(`/vehicles/${id}/restock`, { quantity }),
};
