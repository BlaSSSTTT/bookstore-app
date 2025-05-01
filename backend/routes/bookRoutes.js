const express = require('express');
const { Book, Author, Genre } = require('../models');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger'); // Додаємо логгер
const upload = require('../middleware/upload');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware для перевірки авторизації та ролей
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token');
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    logger.warn(`Access denied for role: ${req.user.role}`);
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// Отримання всіх книг
router.get('/', authenticate, async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [{ model: Author }, { model: Genre }],
    });
    logger.info(`Books fetched by user: ${req.user.userId}`);
    res.json(books);
  } catch (error) {
    logger.error(`Error fetching books: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Створення книги
router.post('/', authenticate, restrictTo('admin', 'manager', 'user'), upload.single('image'), async (req, res) => {
  try {
    const { title, isbn, publisher, publicationYear, price, quantity, authorId, genreId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const book = await Book.create({
      title,
      isbn,
      publisher,
      publicationYear,
      price,
      quantity,
      authorId,
      genreId,
      image,
    });
    logger.info(`Book created by admin: ${req.user.userId} - Book ID: ${book.id}`);
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    await logAction(req.user.id, 'create_book', { error: error.message }, 'error');
    res.status(500).json({ error: 'Server error' });
  }
});

// Оновлення кількості книги
router.patch('/:id', authenticate, restrictTo('admin', 'manager'), async (req, res) => {
  const { quantity } = req.body;
  try {
    if (typeof quantity !== 'number') {
      logger.warn(`Invalid quantity type by user: ${req.user.userId}`);
      return res.status(400).json({ error: 'Quantity must be a number' });
    }

    const book = await Book.findByPk(req.params.id);
    if (!book) {
      logger.warn(`Book not found (ID: ${req.params.id})`);
      return res.status(404).json({ error: 'Book not found' });
    }

    book.quantity += quantity;
    await book.save();
    logger.info(`Book quantity updated by user: ${req.user.userId} - Book ID: ${book.id}`);
    res.json(book);
  } catch (error) {
    logger.error(`Error updating book quantity: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Видалення книги
router.delete('/:id', authenticate, restrictTo('admin'), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      logger.warn(`Book not found (ID: ${req.params.id})`);
      return res.status(404).json({ error: 'Book not found' });
    }

    await book.destroy();
    logger.info(`Book deleted by admin: ${req.user.userId} - Book ID: ${book.id}`);
    res.json({ message: 'Book deleted' });
  } catch (error) {
    logger.error(`Error deleting book: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
