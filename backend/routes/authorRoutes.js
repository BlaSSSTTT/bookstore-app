const express = require('express');
const { Author } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger'); // Припускаю, що logger є в utils/logger.js

const router = express.Router();

router.use(authMiddleware);

// Створення автора
router.post('/', async (req, res) => {
  try {
    const author = await Author.create(req.body);
    logger.info(`User ${req.user.email} (${req.user.role}) created author: ${author.name}`);
    res.status(201).json(author);
  } catch (error) {
    logger.error(`Error creating author by ${req.user.email}: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Отримання всіх авторів
router.get('/', async (req, res) => {
  try {
    const authors = await Author.findAll();
    logger.info(`User ${req.user.email} (${req.user.role}) fetched ${authors.length} authors`);
    res.json(authors);
  } catch (error) {
    logger.error(`Error fetching authors by ${req.user.email}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Отримання одного автора
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (author) {
      logger.info(`User ${req.user.email} (${req.user.role}) fetched author ID ${author.id}`);
      res.json(author);
    } else {
      logger.warn(`User ${req.user.email} (${req.user.role}) tried to fetch non-existent author ID ${req.params.id}`);
      res.status(404).json({ error: 'Author not found' });
    }
  } catch (error) {
    logger.error(`Error fetching author ID ${req.params.id} by ${req.user.email}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Оновлення автора
router.put('/:id', async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (author) {
      await author.update(req.body);
      logger.info(`User ${req.user.email} (${req.user.role}) updated author ID ${author.id}`);
      res.json(author);
    } else {
      logger.warn(`User ${req.user.email} (${req.user.role}) tried to update non-existent author ID ${req.params.id}`);
      res.status(404).json({ error: 'Author not found' });
    }
  } catch (error) {
    logger.error(`Error updating author ID ${req.params.id} by ${req.user.email}: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Видалення автора
router.delete('/:id', async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (author) {
      await author.destroy();
      logger.info(`User ${req.user.email} (${req.user.role}) deleted author ID ${author.id}`);
      res.json({ message: 'Author deleted' });
    } else {
      logger.warn(`User ${req.user.email} (${req.user.role}) tried to delete non-existent author ID ${req.params.id}`);
      res.status(404).json({ error: 'Author not found' });
    }
  } catch (error) {
    logger.error(`Error deleting author ID ${req.params.id} by ${req.user.email}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
