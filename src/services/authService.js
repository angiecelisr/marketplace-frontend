import api from '../api/axiosClient';

// Registro de nuevos usuarios
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Iniciar sesión y guardar token JWT
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Cerrar sesión
export const logoutUser = () => {
  localStorage.removeItem('token');
};