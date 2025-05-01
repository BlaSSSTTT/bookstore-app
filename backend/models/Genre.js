const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Genre = sequelize.define('Genre', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
  });

  Genre.associate = (models) => {
    Genre.hasMany(models.Book, { foreignKey: 'genreId' });
  };

  return Genre;
};
