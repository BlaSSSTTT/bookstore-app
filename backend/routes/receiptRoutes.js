const express = require('express');
const { Receipt } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger'); // якщо маєш логер
const router = express.Router();

router.use(authMiddleware);

// Створення Receipt
router.post('/', async (req, res) => {
  try {
    const receipt = await Receipt.create(req.body);
    logger.info(`Receipt created (ID: ${receipt.id}) by user: ${req.user?.userId}`);
    res.status(201).json( receipt);
  } catch (error) {
    logger.error(`Error creating Receipt: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Отримання всіх Receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await Receipt.findAll();
    logger.info(`Receipts fetched by user: ${req.user?.userId}`);
    res.json(receipts);
  } catch (error) {
    logger.error(`Error fetching Receipts: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отримання одного Receipt
router.get('/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id);
    if (receipt) {
      logger.info(`Receipt fetched (ID: ${receipt.id}) by user: ${req.user?.userId}`);
      res.json(receipt);
    } else {
      logger.warn(`Receipt not found (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'Receipt not found' });
    }
  } catch (error) {
    logger.error(`Error fetching Receipt: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Оновлення Receipt
router.put('/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id);
    if (receipt) {
      await receipt.update(req.body);
      logger.info(`Receipt updated (ID: ${receipt.id}) by user: ${req.user?.userId}`);
      res.json(receipt);
    } else {
      logger.warn(`Receipt not found for update (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'Receipt not found' });
    }
  } catch (error) {
    logger.error(`Error updating Receipt: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Видалення Receipt
router.delete('/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id);
    if (receipt) {
      await receipt.destroy();
      logger.info(`Receipt deleted (ID: ${receipt.id}) by user: ${req.user?.userId}`);
      res.json();
    } else {
      logger.warn(`Receipt not found for deletion (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'Receipt not found' });
    }
  } catch (error) {
    logger.error(`Error deleting Receipt: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
