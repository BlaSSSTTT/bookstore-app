const express = require('express');
const { Report, Receipt, Book, ReceiptBook, Employee } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../db'); // Імпорт sequelize для використання в запитах
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const logger = require('../utils/logger'); // Імпорт логера

router.use(authMiddleware);

// Створення звіту (ручне)
router.post('/', async (req, res) => {
  try {
    const report = await Report.create(req.body);
    logger.info(`Report created successfully by User ID: ${req.user.id}, Report ID: ${report.id}`);
    res.status(201).json(report);
  } catch (error) {
    logger.error(`Error creating Report by User ID: ${req.user.id}: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Отримання всіх звітів
router.get('/', async (req, res) => {
  try {
    const reports = await Report.findAll();
    logger.info(`Fetched all reports successfully by User ID: ${req.user.id}`);
    res.json(reports);
  } catch (error) {
    logger.error(`Error fetching Reports by User ID: ${req.user.id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Отримання звіту за ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: Employee, attributes: ['id', 'name'] }]
    });
    if (report) {
      logger.info(`Fetched report with ID: ${req.params.id} successfully by User ID: ${req.user.id}`);
      res.json(report);
    } else {
      logger.warn(`Report with ID: ${req.params.id} not found by User ID: ${req.user.id}`);
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (error) {
    logger.error(`Error fetching Report with ID: ${req.params.id} by User ID: ${req.user.id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Оновлення звіту
router.put('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (report) {
      await report.update(req.body);
      logger.info(`Report with ID: ${req.params.id} updated successfully by User ID: ${req.user.id}`);
      res.json(report);
    } else {
      logger.warn(`Report with ID: ${req.params.id} not found for update by User ID: ${req.user.id}`);
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (error) {
    logger.error(`Error updating Report with ID: ${req.params.id} by User ID: ${req.user.id}: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Видалення звіту
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (report) {
      await report.destroy();
      logger.info(`Report with ID: ${req.params.id} deleted successfully by User ID: ${req.user.id}`);
      res.json({ message: 'Report deleted' });
    } else {
      logger.warn(`Report with ID: ${req.params.id} not found for deletion by User ID: ${req.user.id}`);
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (error) {
    logger.error(`Error deleting Report with ID: ${req.params.id} by User ID: ${req.user.id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Генерація звіту за період
router.post('/generate', async (req, res) => {
  const { startDate, endDate, employeeId } = req.body; // employeeId необов’язковий
  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Форматування дат для коректного порівняння
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Включаємо весь день endDate

    // Формування умов запиту
    const where = {
      date: { [Op.between]: [start, end] }
    };
    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Запит із асоціаціями
    const receipts = await Receipt.findAll({
      where,
      include: [{
        model: Book,
        through: { attributes: ['quantity', 'priceAtPurchase'] },
        include: [{ model: sequelize.models.Genre, attributes: ['name'] }]
      }]
    });

    // Обчислення даних
    const totalRevenue = receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
    const totalSales = receipts.reduce((sum, receipt) => 
      sum + receipt.Books.reduce((s, book) => s + book.ReceiptBook.quantity, 0), 0);
    
    const popularBooks = receipts.reduce((acc, receipt) => {
      receipt.Books.forEach(book => {
        acc[book.title] = (acc[book.title] || 0) + book.ReceiptBook.quantity;
      });
      return acc;
    }, {});

    const salesByDate = receipts.reduce((acc, receipt) => {
      const date = receipt.date.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + receipt.totalAmount;
      return acc;
    }, {});

    const topGenres = receipts.reduce((acc, receipt) => {
      receipt.Books.forEach(book => {
        const genre = book.Genre?.name || 'Unknown';
        acc[genre] = (acc[genre] || 0) + book.ReceiptBook.quantity;
      });
      return acc;
    }, {});

    // Формування текстового вмісту
    const content = `Звіт за період ${startDate} до ${endDate}:\n` +
                    `Загальна виручка: ${totalRevenue} грн\n` +
                    `Кількість проданих книг: ${totalSales}\n` +
                    `Популярні книги: ${Object.entries(popularBooks)
                      .map(([title, qty]) => `${title}: ${qty}`)
                      .join(', ')}\n` +
                    `Популярні жанри: ${Object.entries(topGenres)
                      .map(([genre, qty]) => `${genre}: ${qty}`)
                      .join(', ')}`;

    // Створення звіту
    const report = await Report.create({
      period: `${startDate} до ${endDate}`,
      type: 'sales',
      content,
      totalRevenue,
      totalSales,
      popularBooks,
      data: { salesByDate, topGenres },
      employeeId: employeeId || null,
      createdAt: new Date()
    });

    logger.info(`Report generated successfully for period ${startDate} to ${endDate} by User ID: ${req.user.id}`);
    res.status(201).json(report);
  } catch (error) {
    logger.error(`Error generating report by User ID: ${req.user.id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
