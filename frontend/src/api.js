const API_BASE = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// Аутентифікація
export async function register(user) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(`Failed to register: ${res.status}`);
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error(`Failed to login: ${res.status}`);
  return res.json();
}

// Автори
export async function fetchAuthors() {
  const res = await fetch(`${API_BASE}/authors`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch authors: ${res.status}`);
  return res.json();
}

export async function createAuthor(author) {
  const res = await fetch(`${API_BASE}/authors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(author),
  });
  if (!res.ok) throw new Error(`Failed to create author: ${res.status}`);
  return res.json();
}

export async function deleteAuthor(id) {
  const res = await fetch(`${API_BASE}/authors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete author: ${res.status}`);
  return res.json();
}

// Жанри
export async function fetchGenres() {
  const res = await fetch(`${API_BASE}/genres`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch genres: ${res.status}`);
  return res.json();
}

export async function createGenre(genre) {
  const res = await fetch(`${API_BASE}/genres`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(genre),
  });
  if (!res.ok) throw new Error(`Failed to create genre: ${res.status}`);
  return res.json();
}

export async function deleteGenre(id) {
  const res = await fetch(`${API_BASE}/genres/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete genre: ${res.status}`);
  return res.json();
}

// Книги
export async function fetchBooks() {
  const res = await fetch(`${API_BASE}/books`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`);
  return res.json();
}

export async function createBook(bookData) {
  try {
    const formData = new FormData();
    Object.entries(bookData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    console.log('Sending FormData:', [...formData.entries()]); // Дебаг
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeaders().Authorization, // Тільки Authorization, без Content-Type
      },
      body: formData,
    });
    if (!res.ok) throw new Error(`Failed to create book: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Create book error:', error);
    throw error;
  }
}

export async function updateBookQuantity(id, quantity) {
  const res = await fetch(`${API_BASE}/books/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error(`Failed to update book quantity: ${res.status}`);
  return res.json();
}

export async function updateBook(id, book) {
  const res = await fetch(`${API_BASE}/books/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error(`Failed to update book: ${res.status}`);
  return res.json();
}

export async function deleteBook(id) {
  const res = await fetch(`${API_BASE}/books/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete book: ${res.status}`);
  return res.json();
}

// Чеки
export async function fetchReceipts() {
  const res = await fetch(`${API_BASE}/receipts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch receipts: ${res.status}`);
  return res.json();
}

export async function createReceipt(receipt) {
  const res = await fetch(`${API_BASE}/receipts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(receipt),
  });
  if (!res.ok) throw new Error(`Failed to create receipt: ${res.status}`);
  return res.json();
}

export async function deleteReceipt(id) {
  const res = await fetch(`${API_BASE}/receipts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete receipt: ${res.status}`);
  return res.json();
}

// Чеки+книга
export async function fetchReceiptBooks() {
  const res = await fetch(`${API_BASE}/receiptBooks`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch receipt books: ${res.status}`);
  return res.json();
}

export async function createReceiptBooks(receiptBook) {
  const res = await fetch(`${API_BASE}/receiptBooks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(receiptBook),
  });
  if (!res.ok) throw new Error(`Failed to create receipt book: ${res.status}`);
  return res.json();
}

export async function deleteReceiptBooks(id) {
  const res = await fetch(`${API_BASE}/receiptBooks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete receipt book: ${res.status}`);
  return res.json();
}

// Клієнти
export async function fetchClients() {
  const res = await fetch(`${API_BASE}/clients`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);
  return res.json();
}

export async function fetchClient(id) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { // Виправлено шлях
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch client: ${res.status}`);
  return res.json();
}

export async function updateClient(id, client) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { // Виправлено шлях
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error(`Failed to update client: ${res.status}`);
  return res.json();
}

export async function createClient(client) {
  const res = await fetch(`${API_BASE}/clients`, { // Виправлено шлях
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error(`Failed to create client: ${res.status}`);
  return res.json();
}

export async function deleteClient(id) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { // Виправлено шлях
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete client: ${res.status}`);
  return res.json();
}

// Репорти
export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
  return res.json();
}

export async function createReport(report) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error(`Failed to create report: ${res.status}`);
  return res.json();
}

export async function deleteReport(id) {
  const res = await fetch(`${API_BASE}/reports/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete report: ${res.status}`);
  return res.json();
}

export async function generateReport({ startDate, endDate, employeeId }) {
  const res = await fetch(`${API_BASE}/reports/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ startDate, endDate, employeeId }),
  });
  if (!res.ok) throw new Error(`Failed to generate report: ${res.status}`);
  return res.json();
}