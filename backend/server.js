// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Підключаємо базу даних і моделі
const { sequelize } = require('./models');

// Імпортуємо маршрути
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');
const genreRoutes = require('./routes/genreRoutes');
const clientRoutes = require('./routes/clientRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const reportRoutes = require('./routes/reportRoutes');
const receiptBookRoutes = require('./routes/receiptBookRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Роутери
app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/receiptBooks', receiptBookRoutes);
app.use('/api/auth', authRoutes);
// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Підключення до бази даних успішне.');
    // Якщо потрібно, створення/синхронізація таблиць (при розробці, можна використовувати force: true)
    await sequelize.sync({ alter: true });
    console.log(`🚀 Сервер запущено на порті ${PORT}`);
  } catch (error) {
    console.error('❌ Помилка підключення до бази даних:', error);
  }
});
