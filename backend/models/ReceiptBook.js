const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReceiptBook = sequelize.define('ReceiptBook', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    priceAtPurchase: { type: DataTypes.FLOAT, allowNull: false }
  });

  return ReceiptBook;
};
