const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'welltalk',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL Database Connected Successfully');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('✅ Database Models Synchronized');
    
    return sequelize;
  } catch (error) {
    logger.error('❌ MySQL Connection Error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await sequelize.close();
    logger.info('✅ MySQL Disconnected');
  } catch (error) {
    logger.error('❌ MySQL Disconnection Error:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  disconnectDB,
};
