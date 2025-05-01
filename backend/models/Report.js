const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'sales',
      validate: {
        isIn: [['sales', 'inventory', 'genres', 'financial']]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    totalRevenue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0
    },
    totalSales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    popularBooks: {
      type: DataTypes.JSON,
      allowNull: true
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Reports',
    timestamps: false
  });

  Report.associate = (models) => {
    Report.belongsTo(models.Employee, { foreignKey: 'employeeId', allowNull: true });
  };

  return Report;
};