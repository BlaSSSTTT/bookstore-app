const express = require('express');
const { ReceiptBook } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger'); // Опціонально
const router = express.Router();

router.use(authMiddleware);

// Створення ReceiptBook
router.post('/', async (req, res) => {
  try {
    const receiptBook = await ReceiptBook.create(req.body);
    logger.info(`ReceiptBook created (ID: ${receiptBook.id}) by user: ${req.user?.userId}`);
    res.status(201).json(receiptBook);
  } catch (error) {
    logger.error(`Error creating ReceiptBook: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Отримання всіх ReceiptBooks
router.get('/', async (req, res) => {
  try {
    const receiptBooks = await ReceiptBook.findAll();
    logger.info(`ReceiptBooks fetched by user: ${req.user?.userId}`);
    res.json(receiptBooks);
  } catch (error) {
    logger.error(`Error fetching ReceiptBooks: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отримання одного ReceiptBook
router.get('/:id', async (req, res) => {
  try {
    const receiptBook = await ReceiptBook.findByPk(req.params.id);
    if (receiptBook) {
      logger.info(`ReceiptBook fetched (ID: ${receiptBook.id}) by user: ${req.user?.userId}`);
      res.json(receiptBook);
    } else {
      logger.warn(`ReceiptBook not found (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'ReceiptBook not found' });
    }
  } catch (error) {
    logger.error(`Error fetching ReceiptBook: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Оновлення ReceiptBook
router.put('/:id', async (req, res) => {
  try {
    const receiptBook = await ReceiptBook.findByPk(req.params.id);
    if (receiptBook) {
      await receiptBook.update(req.body);
      logger.info(`ReceiptBook updated (ID: ${receiptBook.id}) by user: ${req.user?.userId}`);
      res.json(receiptBook);
    } else {
      logger.warn(`ReceiptBook not found for update (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'ReceiptBook not found' });
    }
  } catch (error) {
    logger.error(`Error updating ReceiptBook: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Видалення ReceiptBook
router.delete('/:id', async (req, res) => {
  try {
    const receiptBook = await ReceiptBook.findByPk(req.params.id);
    if (receiptBook) {
      await receiptBook.destroy();
      logger.info(`ReceiptBook deleted (ID: ${receiptBook.id}) by user: ${req.user?.userId}`);
      res.json();
    } else {
      logger.warn(`ReceiptBook not found for deletion (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'ReceiptBook not found' });
    }
  } catch (error) {
    logger.error(`Error deleting ReceiptBook: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
