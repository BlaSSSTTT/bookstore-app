const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger'); // Додаємо логгер

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Зберігайте в .env

// Реєстрація
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ['user', 'manager', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'user';

    const user = await User.create({
      email,
      password: hashedPassword,
      role: userRole,
      employeeId: null
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User registered: ${email} with role: ${userRole}`);
    res.status(201).json({ token });
  } catch (error) {
    logger.error(`Registration error for ${email}: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Логін
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      logger.warn(`Login attempt with missing email or password`);
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Failed login attempt with non-existent email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email} (wrong password)`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, employeeId: user.employeeId, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User logged in: ${email} (role: ${user.role})`);
    res.json({ token });
  } catch (error) {
    logger.error(`Login error for ${email}: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
