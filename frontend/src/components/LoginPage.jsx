import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Page.css';

function LoginPage() {
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Помилка входу');
      }
      localStorage.setItem('token', data.token);
      navigate('/books');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Вхід</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-input"
          placeholder="Ім’я користувача"
          value={email}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-input"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-message">{error}</div>}
        <div className="modal-buttons centered-buttons">
          <button type="submit" className="modal-button submit-button">
            Увійти
          </button>
        </div>
      </form>
      <div className="switch-link">
        Немає акаунта? <Link to="/register">Зареєструватися</Link>
      </div>
    </div>
  );
}

export default LoginPage;