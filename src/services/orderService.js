import api from '../api/axiosClient';

// Crear una nueva orden
export const createOrder = async (items) => {
  const response = await api.post('/orders', { items });
  return response.data;
};

// Obtener el historial de órdenes del usuario autenticado
export const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// Cancelar una orden propia
export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}/cancel`);
  return response.data;
};