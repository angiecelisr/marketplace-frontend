import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://marketplace-backend-2kcd.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para enviar el token JWT automáticamente en peticiones protegidas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;