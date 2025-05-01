import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../css/Page.css';

function Navbar() {
  const navigate = useNavigate();
  let role = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/books" className="navbar-logo">
          BookStore
        </Link>
        <div className="nav-links">
          <Link to="/authors">Автори</Link>
          <Link to="/genres">Жанри</Link>
          <Link to="/books">Книги</Link>
          {['manager', 'admin'].includes(role) && <Link to="/clients">Клієнти</Link>}
          {['manager', 'admin'].includes(role) && <Link to="/receipts">Чеки</Link>}
          {role === 'admin' && <Link to="/reports">Звіти</Link>}
          <button onClick={handleLogout} className="logout-button">
            Вийти
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;