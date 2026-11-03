import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach the JWT (FR1) to every outgoing request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, force a logout back to the login screen
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
export { API_BASE_URL };
