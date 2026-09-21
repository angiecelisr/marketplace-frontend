import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import CreateProductForm from './components/CreateProductForm';
import { getProducts, deleteProduct } from './services/productService';
import { logoutUser } from './services/authService';

// URL base de la API backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Imagen por defecto en SVG vectorial directamente en código para evitar bloqueos/errores de SSL
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%232a2a2a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888888" font-family="sans-serif" font-size="18">Sin Imagen</text></svg>';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados para Búsqueda, Filtro y Modal de Detalle
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron obtener los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  // Manejador para eliminar un producto
  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProduct(id);
        fetchProducts(); // Recarga los productos tras eliminar
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        alert('No se pudo eliminar el producto.');
      }
    }
  };

  // Función auxiliar para construir la URL correcta de la imagen
  const getImageUrl = (url) => {
    if (!url) return PLACEHOLDER_IMAGE;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanBase = API_URL.replace(/\/$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBase}${cleanPath}`;
  };

  // Filtrado de productos en frontend
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
                            product.category?.name === selectedCategory ||
                            String(product.categoryId) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="catalog-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ color: 'var(--text-h)', margin: 0 }}>Marketplace App</h1>
        {isAuthenticated && (
          <button 
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cerrar Sesión
          </button>
        )}
      </header>

      {/* Autenticación o Formulario de Creación */}
      {!isAuthenticated ? (
        <AuthForm onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <CreateProductForm onProductCreated={fetchProducts} />
      )}

      {/* Catálogo de Productos */}
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--text-h)' }}>Catálogo de Productos</h2>

        {/* Controles de Búsqueda y Filtro */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--code-bg)', color: 'var(--text)' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--code-bg)', color: 'var(--text)' }}
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="Servicios">Servicios</option>
            <option value="Productos">Productos</option>
          </select>
        </div>

        {loading && <p style={{ color: 'var(--text)' }}>Cargando productos...</p>}
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {filteredProducts.length === 0 ? (
              <p style={{ color: 'var(--text)' }}>No se encontraron productos coincidentes.</p>
            ) : (
              filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="image-wrapper">
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.title} 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>

                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-footer">
                      <span className="product-price">
                        ${Number(product.price).toLocaleString()}
                      </span>
                      <span className="category-badge">
                        {product.category?.name || 'Servicios'}
                      </span>
                    </div>

                    {/* Botón Eliminar (solo visible si el usuario está autenticado) */}
                    {isAuthenticated && (
                      <div style={{ marginTop: '0.8rem', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Evita abrir el modal al hacer clic en eliminar
                            handleDeleteProduct(product.id);
                          }}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Modal de Detalle de Producto */}
      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--code-bg)', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setSelectedProduct(null)}
              style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: 'var(--text-h)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <div className="image-wrapper" style={{ height: '250px', borderRadius: '8px', marginBottom: '1rem' }}>
              <img 
                src={getImageUrl(selectedProduct.imageUrl)} 
                alt={selectedProduct.title} 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
            <h2 className="product-title" style={{ fontSize: '1.5rem' }}>{selectedProduct.title}</h2>
            <p className="product-price" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              ${Number(selectedProduct.price).toLocaleString()}
            </p>
            <p className="product-description">{selectedProduct.description}</p>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}