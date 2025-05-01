import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Page.css';

function RegisterPage() {
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Register request:', { email, password, role });
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      console.log(response);
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || 'Помилка реєстрації');
      }
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Реєстрація</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-input"
          placeholder="Email користувача"
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
        <select
          className="form-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">Користувач</option>
          <option value="manager">Менеджер</option>
          <option value="admin">Адміністратор</option>
        </select>
        {error && <div className="error-message">{error}</div>}
        <div className="modal-buttons centered-buttons">
          <button type="submit" className="modal-button submit-button">
            Зареєструватися
          </button>
        </div>
      </form>
      <div className="switch-link">
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </div>
    </div>
  );
}

export default RegisterPage;