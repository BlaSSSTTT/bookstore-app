const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true }); // force: true - щоразу пересоздає таблиці
    console.log('✅ Database synchronized successfully.');
    process.exit();
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    process.exit(1);
  }
}

syncDatabase();
