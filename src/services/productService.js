import api from '../api/axiosClient';

// Obtener catálogo público (acepta filtros como { categoryId, search })
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Crear un nuevo producto (ruta protegida)
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Eliminar un producto por ID (Módulo 4)
export const deleteProduct = async (id) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Subir una imagen al servidor (/api/upload)
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.imageUrl; // Retorna la URL generada
};