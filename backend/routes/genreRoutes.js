const express = require('express');
const { Genre } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger'); // Логер (якщо ти додаєш)

const router = express.Router();
router.use(authMiddleware);

// Створення жанру
router.post('/', async (req, res) => {
  try {
    const genre = await Genre.create(req.body);
    logger.info(`Genre created (ID: ${genre.id}) by user: ${req.user?.userId}`);
    res.status(201).json(genre);
  } catch (error) {
    logger.error(`Error creating genre: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Отримання всіх жанрів
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.findAll();
    logger.info(`Genres fetched by user: ${req.user?.userId}`);
    res.json(genres);
  } catch (error) {
    logger.error(`Error fetching genres: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отримання одного жанру за ID
router.get('/:id', async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);
    if (genre) {
      logger.info(`Genre fetched (ID: ${genre.id}) by user: ${req.user?.userId}`);
      res.json(genre);
    } else {
      logger.warn(`Genre not found (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'Genre not found' });
    }
  } catch (error) {
    logger.error(`Error fetching genre: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Оновлення жанру
router.put('/:id', async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);
    if (genre) {
      await genre.update(req.body);
      logger.info(`Genre updated (ID: ${genre.id}) by user: ${req.user?.userId}`);
      res.json(genre);
    } else {
      logger.warn(`Genre not found for update (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'Genre not found' });
    }
  } catch (error) {
    logger.error(`Error updating genre: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Видалення жанру
router.delete('/:id', async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);
    if (genre) {
      await genre.destroy();
      logger.info(`Genre deleted (ID: ${genre.id}) by user: ${req.user?.userId}`);
      res.json({ success: true, message: 'Genre deleted' });
    } else {
      logger.warn(`Genre not found for deletion (ID: ${req.params.id})`);
      res.status(404).json({ success: false, error: 'Genre not found' });
    }
  } catch (error) {
    logger.error(`Error deleting genre: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
