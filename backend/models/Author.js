const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Author = sequelize.define('Author', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING }
  });

  Author.associate = (models) => {
    Author.hasMany(models.Book, { foreignKey: 'authorId' });
  };

  return Author;
};
