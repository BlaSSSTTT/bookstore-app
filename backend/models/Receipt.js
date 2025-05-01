const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receipt = sequelize.define('Receipt', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    clientId: { // Додаємо поле clientId
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id',
      },
    },
  });

  Receipt.associate = (models) => {
    Receipt.belongsTo(models.Employee, { foreignKey: 'employeeId' });
    Receipt.belongsTo(models.Client, { foreignKey: 'clientId' }); // Додаємо зв’язок із Client
    Receipt.belongsToMany(models.Book, { through: 'ReceiptBook', foreignKey: 'receiptId' });
  };

  return Receipt;
};