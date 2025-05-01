import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClients, fetchClient, createClient, updateClient, deleteClient } from '../api';
import '../css/Page.css';
import { jwtDecode } from 'jwt-decode';

function ClientPage() {
  const [fullName, setFullName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [discountCard, setDiscountCard] = useState('');
  const [clients, setClients] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filterFullName, setFilterFullName] = useState('');
  const [filterDiscountCard, setFilterDiscountCard] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;
  const canManageClients = user && ['admin', 'manager'].includes(user.role);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      loadClients();
    }
  }, [navigate]);

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createClient({ fullName, contactInfo, discountCard });
      setFullName('');
      setContactInfo('');
      setDiscountCard('');
      setIsCreateModalOpen(false);
      loadClients();
      setMessage('Клієнта успішно додано!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating client:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateClient(selectedClient.id, { fullName, contactInfo, discountCard });
      setFullName('');
      setContactInfo('');
      setDiscountCard('');
      setIsEditModalOpen(false);
      setSelectedClient(null);
      loadClients();
      setMessage('Клієнта успішно оновлено!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating client:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = async (clientId) => {
    try {
      await deleteClient(clientId);
      setIsDetailsModalOpen(false);
      setSelectedClient(null);
      loadClients();
      setMessage('Клієнта успішно видалено!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting client:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const openDetailsModal = async (client) => {
    try {
      const clientData = await fetchClient(client.id);
      setSelectedClient(clientData);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching client details:', error);
      setMessage(`Помилка: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFullName(client.fullName);
    setContactInfo(client.contactInfo || '');
    setDiscountCard(client.discountCard || '');
    setIsEditModalOpen(true);
  };

  const clearFilters = () => {
    setFilterFullName('');
    setFilterDiscountCard('');
  };

  const filteredClients = clients.filter((client) => {
    const matchesFullName = client.fullName.toLowerCase().includes(filterFullName.toLowerCase());
    const matchesDiscountCard = filterDiscountCard
      ? client.discountCard?.toLowerCase().includes(filterDiscountCard.toLowerCase())
      : true;
    return matchesFullName && matchesDiscountCard;
  });

  // Мапа ISBN на обкладинки з попереднього запиту
  const bookCovers = {
    '978-966-7047-59-5': 'https://www.yakaboo.ua/ua/gra-prestoliv.html', // Гра престолів
    '978-966-1234-56-7': 'https://www.yakaboo.ua/ua/solaris.html', // Соляріс
    // Додайте інші ISBN за потреби
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Клієнти</h1>
      {message && (
        <div className={`message ${message.includes('Помилка') ? 'error-message' : 'success-message'} mb-4`}>
          {message}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        {canManageClients && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="modal-button submit-button"
          >
            Додати клієнта
          </button>
        )}
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
                <label className="block text-sm font-medium text-4a3728 mb-1">ПІБ</label>
                <input
                  type="text"
                  placeholder="ПІБ клієнта"
                  value={filterFullName}
                  onChange={(e) => setFilterFullName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="filter-field">
                <label className="block text-sm font-medium text-4a3728 mb-1">Дисконтна картка</label>
                <input
                  type="text"
                  placeholder="Номер картки"
                  value={filterDiscountCard}
                  onChange={(e) => setFilterDiscountCard(e.target.value)}
                  className="form-input"
                />
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
            <h2 className="modal-header text-2xl font-bold mb-4">Додати нового клієнта</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ПІБ"
                  required
                  className="form-input"
                />
                <input
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Контактна інформація"
                  className="form-input"
                />
                <input
                  value={discountCard}
                  onChange={(e) => setDiscountCard(e.target.value)}
                  placeholder="Номер дисконтної картки"
                  className="form-input col-span-2"
                />
              </div>
              <div className="modal-buttons flex justify-center space-x-4 mt-4">
                <button
                  type="button"
                  className="modal-button cancel-button"
                  onClick={() => setIsCreateModalOpen(false)}
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

      {isEditModalOpen && selectedClient && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="modal-header text-2xl font-bold mb-4">Редагувати клієнта</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ПІБ"
                  required
                  className="form-input"
                />
                <input
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Контактна інформація"
                  className="form-input"
                />
                <input
                  value={discountCard}
                  onChange={(e) => setDiscountCard(e.target.value)}
                  placeholder="Номер дисконтної картки"
                  className="form-input col-span-2"
                />
              </div>
              <div className="modal-buttons flex justify-center space-x-4 mt-4">
                <button
                  type="button"
                  className="modal-button cancel-button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="modal-button submit-button"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedClient && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="details-modal-content bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="modal-header text-3xl font-bold mb-6 text-center text-4a3728">
              {selectedClient.fullName}
            </h2>
            <div className="form-fields space-y-4">
              <div className="book-detail-card">
                <span className="book-detail-label">Контактна інформація:</span>
                <span className="book-detail-value">{selectedClient.contactInfo || 'Немає'}</span>
              </div>
              <div className="book-detail-card">
                <span className="book-detail-label">Дисконтна картка:</span>
                <span className="book-detail-value">{selectedClient.discountCard || 'Немає'}</span>
              </div>
              <div className="book-detail-card">
                <span className="book-detail-label">Чеки:</span>
                <div className="book-detail-value w-full">
                  {selectedClient.Receipts && selectedClient.Receipts.length > 0 ? (
                    <div className="space-y-4">
                      {selectedClient.Receipts.map((receipt) => (
                        <div key={receipt.id} className="receipt-item margin-bottom">
                          <div className="receipt-item-details-client">
                            <span className="receipt-item-title-client">
                              Чек #{receipt.id} від {new Date(receipt.date).toLocaleDateString('uk-UA')}
                            </span>
                            <span className="receipt-item-total-client">
                              {receipt.totalAmount} грн
                            </span>
                          </div>
                          <ul className="list-disc pl-5 mt-2">
                            {receipt.Books.map((book) => (
                              <li key={book.id} className="flex items-center space-x-3">
                                <div>
                                  <span className="font-semibold">{book.title}</span>
                                  <div className="text-sm text-8c7a6b">
                                    ISBN: {book.isbn} | Ціна: {book.price} грн
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">Немає чеків</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-buttons flex justify-end space-x-4 mt-6">
              <button
                type="button"
                className="modal-button cancel-button"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Закрити
              </button>
              {canManageClients && (
                <button
                  className="modal-button submit-button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openEditModal(selectedClient);
                  }}
                >
                  Редагувати
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  className="modal-button delete-button"
                  onClick={() => handleDelete(selectedClient.id)}
                >
                  Видалити
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="item-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openDetailsModal(client)}
          >
            <h3 className="text-lg font-semibold">{client.fullName}</h3>
            <p className="client-preview text-gray-600">Дисконтна картка: {client.discountCard || 'Немає'}</p>
            <p className="client-preview text-gray-600">Контакти: {client.contactInfo || 'Немає'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientPage;