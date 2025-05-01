import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBook, fetchBooks, fetchAuthors, fetchGenres, deleteBook, updateBookQuantity } from '../api';
import '../css/Page.css';
import { jwtDecode } from 'jwt-decode';

function BookPage() {
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [image, setImage] = useState(null); // Додаємо стан для зображення
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [addQuantity, setAddQuantity] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;
  const canManageStock = user && ['admin', 'manager'].includes(user.role);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      loadBooks();
      loadAuthors();
      loadGenres();
    }
  }, [navigate]);

  const loadBooks = async () => {
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

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
      const bookData = {
        title,
        isbn,
        publisher,
        publicationYear: parseInt(publicationYear),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        authorId: parseInt(authorId),
        genreId: parseInt(genreId),
      };
      if (image) {
        bookData.image = image;
      }
      await createBook(bookData);
      setTitle('');
      setIsbn('');
      setPublisher('');
      setPublicationYear('');
      setPrice('');
      setQuantity('');
      setAuthorId('');
      setGenreId('');
      setImage(null);
      setIsCreateModalOpen(false);
      loadBooks();
      setMessage('Книгу успішно додано!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating book:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleAddQuantity = async (bookId) => {
    if (!addQuantity || isNaN(addQuantity) || parseInt(addQuantity) <= 0) {
      setMessage('Будь ласка, введіть коректну кількість');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      await updateBookQuantity(bookId, parseInt(addQuantity));
      setAddQuantity('');
      loadBooks();
      setSelectedBook((prev) => ({
        ...prev,
        quantity: prev.quantity + parseInt(addQuantity),
      }));
      setMessage(`Додано ${addQuantity} одиниць до книги!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding quantity:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401') || error.message.includes('403')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await deleteBook(bookId);
      setIsDetailsModalOpen(false);
      setSelectedBook(null);
      loadBooks();
      setMessage('Книгу успішно видалено!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting book:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const clearFilters = () => {
    setFilterTitle('');
    setFilterAuthor('');
    setFilterGenre('');
    setFilterPriceMin('');
    setFilterPriceMax('');
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => {
    setTitle('');
    setIsbn('');
    setPublisher('');
    setPublicationYear('');
    setPrice('');
    setQuantity('');
    setAuthorId('');
    setGenreId('');
    setImage(null);
    setIsCreateModalOpen(false);
  };

  const openDetailsModal = (book) => {
    setSelectedBook(book);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBook(null);
    setAddQuantity('');
  };

  const filteredBooks = books.filter((book) => {
    const matchesTitle = book.title.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesAuthor = filterAuthor ? book.authorId === parseInt(filterAuthor) : true;
    const matchesGenre = filterGenre ? book.genreId === parseInt(filterGenre) : true;
    const matchesPrice =
      (!filterPriceMin || book.price >= parseFloat(filterPriceMin)) &&
      (!filterPriceMax || book.price <= parseFloat(filterPriceMax));
    return matchesTitle && matchesAuthor && matchesGenre && matchesPrice;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Книги</h1>
      {message && (
        <div className={`message ${message.includes('Помилка') ? 'error-message' : 'success-message'} mb-4`}>
          {message}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={openCreateModal}
          className="modal-button submit-button"
        >
          Додати книгу
        </button>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="modal-button cancel-button"
        >
          {isFilterOpen ? 'Приховати фільтри' : 'Фільтри'}
        </button>
      </div>

      {isFilterOpen && (
        <div className="filter-container mb-6 p-6 bg-fefbf7 rounded-lg shadow-md transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-center">Фільтри</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="filter-column flex flex-col gap-4 w-full sm:w-64">
              <div className="filter-field">
                <label className="block text-sm font-medium text-4a3728 mb-1">Назва книги</label>
                <input
                  type="text"
                  placeholder="Назва книги"
                  value={filterTitle}
                  onChange={(e) => setFilterTitle(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="filter-field">
                <label className="block text-sm font-medium text-4a3728 mb-1">Автор</label>
                <select
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  className="form-input"
                >
                  <option value="">Всі автори</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-column flex flex-col gap-4 w-full sm:w-64">
              <div className="filter-field">
                <label className="block text-sm font-medium text-4a3728 mb-1">Жанр</label>
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="form-input"
                >
                  <option value="">Всі жанри</option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-field">
                <label className="block text-sm font-medium text-4a3728 mb-1">Ціна (грн)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Мін."
                    value={filterPriceMin}
                    onChange={(e) => setFilterPriceMin(e.target.value)}
                    className="form-input w-28 margin-bottom "
                  />
                  <input
                    type="number"
                    placeholder="Макс."
                    value={filterPriceMax}
                    onChange={(e) => setFilterPriceMax(e.target.value)}
                    className="form-input w-28"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="modal-button cancel-button mt-4 w-full sm:w-auto"
            >
              Очистити фільтри
            </button>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="modal-header text-2xl font-bold mb-4">Додати нову книгу</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Назва книги"
                  required
                  className="form-input"
                />
                <input
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="ISBN (напр. 978-966-7047-59-5)"
                  required
                  className="form-input"
                />
                <input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Видавництво"
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(e.target.value)}
                  placeholder="Рік видання"
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                  className="form-input"
                />
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>
                    Оберіть автора
                  </option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <select
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>
                    Оберіть жанр
                  </option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ціна (грн)"
                  step="0.01"
                  min="0"
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Кількість"
                  min="0"
                  required
                  className="form-input"
                />
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-4a3728 mb-1">Зображення книги</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div className="modal-buttons flex justify-center space-x-4 mt-4">
                <button
                  type="button"
                  className="modal-button cancel-button"
                  onClick={closeCreateModal}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="modal-button submit-button"
                >
                  Додати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedBook && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="details-modal-content bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="modal-header text-2xl font-bold mb-4">Деталі книги</h2>
            <div className="form-fields space-y-2">
              {selectedBook.image && (
                <div className="book-detail-card flex justify-center">
                  <img src={`http://localhost:3000${selectedBook.image}`} alt={selectedBook.title} className="book-image" />
                </div>
              )}
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">Назва:</span>
                <span className="book-detail-value">{selectedBook.title}</span>
              </div>
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">ISBN:</span>
                <span className="book-detail-value">{selectedBook.isbn}</span>
              </div>
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">Видавництво:</span>
                <span className="book-detail-value">{selectedBook.publisher}</span>
              </div>
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">Рік видання:</span>
                <span className="book-detail-value">{selectedBook.publicationYear}</span>
              </div>
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">Автор:</span>
                <span className="book-detail-value">{authors.find(a => a.id === selectedBook.authorId)?.name || 'Невідомий'}</span>
              </div>
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">Жанр:</span>
                <span className="book-detail-value">{genres.find(g => g.id === selectedBook.genreId)?.name || 'Невідомий'}</span>
              </div>
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">Ціна:</span>
                <span className="book-detail-value">{selectedBook.price} грн</span>
              </div>
              <div className="book-detail-card flex justify-between">
                <span className="book-detail-label font-semibold">Кількість:</span>
                <span className="book-detail-value">{selectedBook.quantity}</span>
              </div>
              {canManageStock && (
                <div className="book-detail-card flex justify-between items-center">
                  <span className="book-detail-label font-semibold">Додати кількість:</span>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={addQuantity}
                      onChange={(e) => setAddQuantity(e.target.value)}
                      placeholder="Кількість"
                      min="1"
                      className="form-input w-24"
                    />
                    <button
                      onClick={() => handleAddQuantity(selectedBook.id)}
                      className="action-button add-button"
                    >
                      Додати
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-buttons flex justify-center space-x-4 mt-4">
              <button
                type="button"
                className="modal-button cancel-button"
                onClick={closeDetailsModal}
              >
                Закрити
              </button>
              {user?.role === 'admin' && (
                <button
                  className="modal-button delete-button"
                  onClick={() => handleDelete(selectedBook.id)}
                >
                  Видалити
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((b) => (
          <div
            key={b.id}
            className="item-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openDetailsModal(b)}
          >
            {b.image && (
              <img src={`http://localhost:3000${b.image}`} alt={b.title} className="book-image mb-2" />
            )}
            <h3 className="text-lg font-semibold">{b.title}</h3>
            <p className="book-preview text-gray-600">Ціна: {b.price} грн</p>
            <p className="book-preview text-gray-600">Кількість: {b.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookPage;