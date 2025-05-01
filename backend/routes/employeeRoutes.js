const express = require('express');
const { Employee } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.use(authMiddleware);
router.post('/', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (employee) res.json(employee);
    else res.status(404).json({ error: 'Employee not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (employee) {
      await employee.update(req.body);
      res.json(employee);
    } else res.status(404).json({ error: 'Employee not found' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (employee) {
      await employee.destroy();
      res.json({ message: 'Employee deleted' });
    } else res.status(404).json({ error: 'Employee not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
