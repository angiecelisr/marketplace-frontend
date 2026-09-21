import { useState, useRef } from 'react';
import { createProduct, uploadImage } from '../services/productService';

export default function CreateProductForm({ onProductCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '1',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Referencia para reiniciar el campo del archivo <input type="file" />
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica en frontend
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('El precio debe ser un valor mayor a 0.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      let imageUrl = '';

      // 1. Si hay un archivo seleccionado, subirlo a Render
      if (file) {
        imageUrl = await uploadImage(file);
      }

      // 2. Crear el producto en la BD
      await createProduct({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId, 10),
        imageUrl: imageUrl || undefined,
      });

      setMessage('¡Producto creado exitosamente!');
      
      // Limpiar el formulario
      setFormData({ title: '', description: '', price: '', categoryId: '1' });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Resetea el selector de archivos
      }

      // Recargar la lista en la pantalla principal
      if (onProductCreated) onProductCreated();
    } catch (err) {
      console.error('Error al crear el producto:', err);
      setError(err.response?.data?.error || 'No se pudo crear el producto. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto', padding: '1.5rem', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#181818', color: '#fff' }}>
      <h2 style={{ marginTop: 0, textAlign: 'center', color: '#fff' }}>Publicar Nuevo Producto</h2>

      {error && (
        <div style={{ backgroundColor: '#3d1414', border: '1px solid #8b0000', color: '#ff8888', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ backgroundColor: '#123318', border: '1px solid #1e6b27', color: '#68d391', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#ccc' }}>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej. Servicio de Limpieza"
            disabled={loading}
            required
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#262626', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#ccc' }}>Descripción:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe tu producto o servicio..."
            disabled={loading}
            required
            rows="3"
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#262626', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#ccc' }}>Precio ($):</label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            disabled={loading}
            required
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#262626', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#ccc' }}>Imagen del Producto:</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={loading}
            style={{ width: '100%', color: '#ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '0.8rem', 
            backgroundColor: loading ? '#2557a7' : '#3b82f6', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Subiendo e insertando...' : 'Publicar Producto'}
        </button>
      </form>
    </div>
  );
}