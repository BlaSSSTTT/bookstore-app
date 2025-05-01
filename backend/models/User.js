const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'manager', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Employee, { foreignKey: 'employeeId' });
  };

  return User;
};