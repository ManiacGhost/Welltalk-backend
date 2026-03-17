require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('./src/utils/logger');

const testConnections = async () => {
  logger.info('🔍 Testing MySQL connections...\n');

  const configs = [
    {
      name: 'root with no password',
      user: 'root',
      password: null,
    },
    {
      name: 'root with empty string password',
      user: 'root',
      password: '',
    },
    {
      name: 'root from env',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || null,
    },
  ];

  for (const config of configs) {
    try {
      logger.info(`Testing: ${config.name}`);
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: config.user,
        password: config.password,
      });

      logger.info(`✅ Success! Connection details:`);
      logger.info(`   User: ${config.user}`);
      logger.info(`   Password: ${config.password === null ? 'none' : config.password === '' ? 'empty string' : config.password}`);

      await connection.end();
      process.exit(0);
    } catch (error) {
      logger.info(`❌ Failed: ${error.message}\n`);
    }
  }

  logger.info('❌ All connection attempts failed.');
  logger.info('\nPlease check:');
  logger.info('1. MySQL service is running (status: should see MySQL in services)');
  logger.info('2. MySQL port is 3306');
  logger.info('3. Try setting DB_PASSWORD to an actual password if root has one');
  process.exit(1);
};

testConnections();
