require('dotenv').config();
const { sequelize } = require('./src/config/database');
const logger = require('./src/utils/logger');

// Import models to register them
require('./src/models/Category');
require('./src/models/Blog');
require('./src/models/Event');

const migrate = async () => {
  try {
    logger.info('Starting database migration...');

    // Authenticate the connection
    await sequelize.authenticate();
    logger.info('✅ Database connection authenticated');

    // Create/Alter tables based on models
    await sequelize.sync({ alter: true });
    logger.info('✅ Database tables synchronized');

    logger.info('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrate();
