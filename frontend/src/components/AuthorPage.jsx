import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAuthor, fetchAuthors, deleteAuthor } from '../api';
import '../css/Page.css';

function AuthorPage() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [authors, setAuthors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedAuthorId, setExpandedAuthorId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      loadAuthors();
    }
  }, [navigate]);

  const loadAuthors = async () => {
    try {
      const data = await fetchAuthors();
      setAuthors(data);
    } catch (error) {
      console.error('Error loading authors:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAuthor({ name, country });
      setName('');
      setCountry('');
      setIsModalOpen(false);
      loadAuthors();
    } catch (error) {
      console.error('Error creating author:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (authorId) => {
    try {
      await deleteAuthor(authorId);
      setExpandedAuthorId(null); // Collapse the card after deletion
      loadAuthors(); // Refresh the authors list
    } catch (error) {
      console.error('Error deleting author:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setName('');
    setCountry('');
    setIsModalOpen(false);
  };

  const toggleAuthorDetails = (authorId) => {
    setExpandedAuthorId(expandedAuthorId === authorId ? null : authorId);
  };

  return (
    <div className="container">
      <h1>Автори</h1>
      <button onClick={openModal}>Додати автора</button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Додати нового автора</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ім'я"
                  required
                />
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Країна"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={closeModal}>Скасувати</button>
                <button type="submit">Додати</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="grid">
        {authors.map((a) => (
          <div
            key={a.id}
            className="item-card"
            onClick={() => toggleAuthorDetails(a.id)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{a.name}</h3>
            {expandedAuthorId === a.id && (
              <div className="author-details">
                <p>{a.country}</p>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling details when clicking delete
                    handleDelete(a.id);
                  }}
                >
                  Видалити
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuthorPage;