const sequelize = require('../db');

const BookModel = require('./Book')(sequelize);
const AuthorModel = require('./author')(sequelize);
const GenreModel = require('./genre')(sequelize);
const ReceiptModel = require('./Receipt')(sequelize);
const ClientModel = require('./Client')(sequelize);
const EmployeeModel = require('./Employee')(sequelize);
const ReportModel = require('./Report')(sequelize);
const ReceiptBookModel = require('./ReceiptBook')(sequelize);
const UserModel = require('./User')(sequelize);

// Встановлюємо зв'язки
AuthorModel.hasMany(BookModel, { foreignKey: 'authorId' });
BookModel.belongsTo(AuthorModel, { foreignKey: 'authorId' });

GenreModel.hasMany(BookModel, { foreignKey: 'genreId' });
BookModel.belongsTo(GenreModel, { foreignKey: 'genreId' });

ClientModel.hasMany(ReceiptModel, { foreignKey: 'clientId' });
ReceiptModel.belongsTo(ClientModel, { foreignKey: 'clientId' });

EmployeeModel.hasMany(ReceiptModel, { foreignKey: 'employeeId' });
ReceiptModel.belongsTo(EmployeeModel, { foreignKey: 'employeeId' });

BookModel.belongsToMany(ReceiptModel, { through: ReceiptBookModel, foreignKey: 'bookId' });
ReceiptModel.belongsToMany(BookModel, { through: ReceiptBookModel, foreignKey: 'receiptId' });

EmployeeModel.hasOne(UserModel, { foreignKey: 'employeeId' });
UserModel.belongsTo(EmployeeModel, { foreignKey: 'employeeId' });

module.exports = {
  sequelize,
  Book: BookModel,
  Author: AuthorModel,
  Genre: GenreModel,
  Receipt: ReceiptModel,
  Client: ClientModel,
  Employee: EmployeeModel,
  Report: ReportModel,
  ReceiptBook: ReceiptBookModel,
  User: UserModel,
};