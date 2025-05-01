const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define('Client', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    contactInfo: { type: DataTypes.STRING },
    discountCard: { type: DataTypes.STRING }, // Номер дисконтної картки
  });

  Client.associate = (models) => {
    Client.hasMany(models.Receipt, { foreignKey: 'clientId' }); // Додаємо зв’язок із Receipt
  };

  return Client;
};