const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.STRING },
  });

  Employee.associate = (models) => {
    Employee.hasMany(models.Receipt, { foreignKey: 'employeeId' });
  };

  return Employee;
};
