import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGenre, fetchGenres, deleteGenre } from '../api';
import '../css/Page.css';

function GenrePage() {
  const [name, setName] = useState('');
  const [genres, setGenres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGenreId, setExpandedGenreId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      loadGenres();
    }
  }, [navigate]);

  const loadGenres = async () => {
    try {
      const data = await fetchGenres();
      setGenres(data);
    } catch (error) {
      console.error('Error loading genres:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGenre({ name });
      setName('');
      setIsModalOpen(false);
      loadGenres();
    } catch (error) {
      console.error('Error creating genre:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (genreId) => {
    try {
      await deleteGenre(genreId);
      setExpandedGenreId(null); // Collapse the card after deletion
      loadGenres(); // Refresh the genres list
    } catch (error) {
      console.error('Error deleting genre:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setName('');
    setIsModalOpen(false);
  };

  const toggleGenreDetails = (genreId) => {
    setExpandedGenreId(expandedGenreId === genreId ? null : genreId);
  };

  return (
    <div className="container">
      <h1>Жанри</h1>
      <button onClick={openModal}>Додати жанр</button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Додати новий жанр</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Назва жанру"
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
        {genres.map((g) => (
          <div
            key={g.id}
            className="item-card"
            onClick={() => toggleGenreDetails(g.id)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{g.name}</h3>
            {expandedGenreId === g.id && (
              <div className="genre-details">
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling details when clicking delete
                    handleDelete(g.id);
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

export default GenrePage;