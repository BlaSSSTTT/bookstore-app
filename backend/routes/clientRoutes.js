const express = require('express');
const { Client, Receipt, Book } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger'); // Підключаємо логер

const router = express.Router();

// Авторизація для всіх маршрутів
router.use(authMiddleware);

// Створення нового клієнта
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    logger.info(`Client created (ID: ${client.id}) by user: ${req.user?.userId}`);
    res.status(201).json(client);
  } catch (error) {
    logger.error(`Error creating client: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Отримання всіх клієнтів
router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll();
    logger.info(`Clients fetched by user: ${req.user?.userId}`);
    res.json(clients);
  } catch (error) {
    logger.error(`Error fetching clients: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Отримання клієнта за ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        {
          model: Receipt,
          include: [
            {
              model: Book,
              attributes: ['id', 'title', 'isbn', 'price'],
            },
          ],
        },
      ],
    });
    if (client) {
      logger.info(`Client fetched (ID: ${client.id}) by user: ${req.user?.userId}`);
      res.json(client);
    } else {
      logger.warn(`Client not found (ID: ${req.params.id})`);
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    logger.error(`Error fetching client: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Оновлення даних клієнта
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (client) {
      await client.update(req.body);
      logger.info(`Client updated (ID: ${client.id}) by user: ${req.user?.userId}`);
      res.json(client);
    } else {
      logger.warn(`Client not found for update (ID: ${req.params.id})`);
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    logger.error(`Error updating client: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Видалення клієнта
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (client) {
      await client.destroy();
      logger.info(`Client deleted (ID: ${client.id}) by user: ${req.user?.userId}`);
      res.json({ message: 'Client deleted' });
    } else {
      logger.warn(`Client not found for deletion (ID: ${req.params.id})`);
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    logger.error(`Error deleting client: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
