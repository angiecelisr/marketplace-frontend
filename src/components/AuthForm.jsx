import { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

export default function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        await loginUser({ email: formData.email, password: formData.password });
        setMessage('¡Inicio de sesión exitoso!');
        if (onLoginSuccess) onLoginSuccess();
      } else {
        await registerUser(formData);
        setMessage('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '1rem' }}>
            <label>Nombre:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '0.7rem', cursor: 'pointer' }}>
          {isLogin ? 'Ingresar' : 'Crear Cuenta'}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer' }}
      >
        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  );
}