const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('bookStore', 'postgres', '1111', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // не виводити запити в консоль
});

module.exports = sequelize;
