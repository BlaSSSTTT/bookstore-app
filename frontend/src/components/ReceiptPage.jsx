import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReceipt, fetchReceipts, fetchBooks, updateBookQuantity, deleteReceipt, createReceiptBooks, fetchReceiptBooks, fetchClients } from '../api';
import '../css/Page.css';

function ReceiptPage() {
  const [cart, setCart] = useState([]); // [{ bookId, quantity, title, price }]
  const [books, setBooks] = useState([]); // Available books with quantity > 0
  const [receipts, setReceipts] = useState([]);
  const [clients, setClients] = useState([]); // Список клієнтів
  const [clientId, setClientId] = useState(''); // Вибраний клієнт
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      loadReceipts();
      loadBooks();
      loadClients();
    }
  }, [navigate]);

  const loadReceipts = async () => {
    try {
      const data = await fetchReceipts();
      const receiptsBooks = await fetchReceiptBooks();
      const booksData = await fetchBooks();
      const clientsData = await fetchClients();
      receiptsBooks.forEach((item) => {
        const book = booksData.find((b) => b.id === item.bookId);
        if (book) {
          item.title = book.title;
          item.price = item.priceAtPurchase;
        }
      });
      const receiptsWithItems = data.map((receipt) => {
        const items = receiptsBooks.filter((item) => item.receiptId === receipt.id);
        const client = clientsData.find((c) => c.id === receipt.clientId);
        return { ...receipt, items, clientName: client ? client.fullName : 'Невідомий' };
      });
      setReceipts(receiptsWithItems);
    } catch (error) {
      console.error('Error loading receipts:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const loadBooks = async () => {
    try {
      const data = await fetchBooks();
      setBooks(data.filter((book) => book.quantity > 0));
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

  const loadClients = async () => {
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const addToCart = (book) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      if (existing) {
        return prev.map((item) =>
          item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { bookId: book.id, title: book.title, price: book.price, quantity: 1 }];
    });
  };

  const updateCartQuantity = (bookId, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.bookId === bookId ? { ...item, quantity: Math.max(0, parseInt(quantity) || 0) } : item
      )
    );
  };

  const removeFromCart = (bookId) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setMessage('Помилка: Кошик порожній');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!clientId) {
      setMessage('Помилка: Виберіть клієнта');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      const totalAmount = parseFloat(calculateTotal());
      const receipt = await createReceipt({ totalAmount, clientId: parseInt(clientId) });

      for (const item of cart) {
        const book = books.find((b) => b.id === item.bookId);
        if (book) {
          const newQuantity = -item.quantity;
          await updateBookQuantity(item.bookId, newQuantity);

          const receiptBook = {
            receiptId: receipt.id,
            bookId: item.bookId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          };
          await createReceiptBooks(receiptBook);
        }
      }

      setCart([]);
      setClientId('');
      setIsCreateModalOpen(false);
      loadReceipts();
      loadBooks();
      setMessage('Чек успішно створено!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating receipt:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (receiptId) => {
    try {
      await deleteReceipt(receiptId);
      setIsDetailsModalOpen(false);
      setSelectedReceipt(null);
      loadReceipts();
      setMessage('Чек успішно видалено!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting receipt:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const downloadJSON = () => {
    if (receipts.length === 0) {
      setMessage('Помилка: Немає чеків для завантаження');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const jsonData = receipts.map((receipt) => ({
      id: receipt.id,
      clientName: receipt.clientName,
      totalAmount: receipt.totalAmount,
      date: receipt.date,
      items: receipt.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      })),
    }));

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'receipts.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage('JSON файл успішно завантажено!');
    setTimeout(() => setMessage(''), 3000);
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => {
    setCart([]);
    setClientId('');
    setIsCreateModalOpen(false);
  };

  const openDetailsModal = (receipt) => {
    setSelectedReceipt(receipt);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReceipt(null);
  };

  return (
    <div className="container">
      <h1 className="text-center">Чеки</h1>
      {message && (
        <div className={`error-message margin ${message.includes('Помилка') ? 'error-message' : ''}`}>
          {message}
        </div>
      )}
      <div className="centered-buttons margin">
        <button onClick={openCreateModal} className="modal-button submit-button">
          Додати чек
        </button>
        <button
          onClick={downloadJSON}
          className="modal-button submit-button"
          disabled={receipts.length === 0}
        >
          Завантажити JSON
        </button>
      </div>
      {isCreateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-header">Створити новий чек</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="margin">
                  <label className="block text-sm font-medium text-4a3728 mb-1">Клієнт</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="" disabled>
                      Оберіть клієнта
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <h3>Доступні книги</h3>
                {books.length === 0 ? (
                  <p className="no-items">Немає книг із кількістю більше 0</p>
                ) : (
                  <div className="table-container">
                    <div className="table-scroll">
                      <table className="book-table">
                        <thead>
                          <tr>
                            <th>Назва</th>
                            <th>Наявність</th>
                            <th>Ціна</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {books.map((book) => (
                            <tr key={book.id}>
                              <td>{book.title}</td>
                              <td>{book.quantity} шт</td>
                              <td>{book.price} грн</td>
                              <td>
                                <button
                                  type="button"
                                  className="action-button add-button"
                                  onClick={() => addToCart(book)}
                                  disabled={cart.find((item) => item.bookId === book.id)?.quantity >= book.quantity}
                                >
                                  Додати
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <h3>Кошик</h3>
                {cart.length === 0 ? (
                  <p className="no-items">Кошик порожній</p>
                ) : (
                  <div className="table-container">
                    <div className="table-scroll">
                      <table className="cart-table">
                        <thead>
                          <tr>
                            <th>Назва</th>
                            <th>Кількість</th>
                            <th>Ціна</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.bookId}>
                              <td>{item.title}</td>
                              <td>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateCartQuantity(item.bookId, e.target.value)}
                                  min="0"
                                  max={books.find((b) => b.id === item.bookId)?.quantity || 0}
                                  className="cart-quantity-input"
                                />
                              </td>
                              <td>{item.price} грн</td>
                              <td>
                                <button
                                  type="button"
                                  className="action-button delete-button"
                                  onClick={() => removeFromCart(item.bookId)}
                                >
                                  Видалити
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="cart-total margin">
                      Загальна сума: <span>{calculateTotal()} грн</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-buttons">
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
                  disabled={cart.length === 0 || !clientId}
                >
                  Створити чек
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDetailsModalOpen && selectedReceipt && (
        <div className="details-modal">
          <div className="details-modal-content">
            <h2 className="modal-header">Чек #{selectedReceipt.id}</h2>
            <div className="form-fields">
              <div className="receipt-items">
                <div className="book-detail-card">
                  <span className="book-detail-label">Клієнт:</span>
                  <span className="book-detail-value">{selectedReceipt.clientName}</span>
                </div>
                {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                  <>
                    <div className="receipt-items-header">
                      <span className="receipt-header-title">Назва</span>
                      <span className="receipt-header-quantity">Кількість</span>
                      <span className="receipt-header-price">Ціна</span>
                      <span className="receipt-header-total">Сума</span>
                    </div>
                    {selectedReceipt.items.map((item, index) => (
                      <div key={index} className="receipt-item">
                        <div className="receipt-item-details">
                          <span className="receipt-item-title">{item.title}</span>
                          <span className="receipt-item-quantity">{item.quantity} шт</span>
                          <span className="receipt-item-price">{item.price} грн</span>
                          <span className="receipt-item-total">
                            {(item.quantity * item.price).toFixed(2)} грн
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="no-items">Немає даних про товари</p>
                )}
              </div>
              <p className="receipt-total margin">
                Загальна сума: <span>{selectedReceipt.totalAmount} грн</span>
              </p>
            </div>
            <div className="modal-buttons">
              <button
                type="button"
                className="modal-button cancel-button"
                onClick={closeDetailsModal}
              >
                Закрити
              </button>
              <button
                className="modal-button delete-button"
                onClick={() => handleDelete(selectedReceipt.id)}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid">
        {receipts.map((r) => (
          <div
            key={r.id}
            className="item-card"
            onClick={() => openDetailsModal(r)}
            style={{ cursor: 'pointer' }}
          >
            <h3>Чек #{r.id}</h3>
            <p className="receipt-preview">Клієнт: {r.clientName}</p>
            <p className="receipt-preview">Сума: {r.totalAmount} грн</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReceiptPage;