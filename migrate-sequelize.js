require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const logger = require('./src/utils/logger');

// Import models to register them
require('./src/models/Category');
require('./src/models/Blog');
require('./src/models/Event');

const migrateWithSequelize = async () => {
  let connection;
  try {
    logger.info('🔄 Starting database migration...\n');

    const dbName = process.env.DB_NAME || 'welltalk';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER || 'root';

    // Step 1: Create database if it doesn't exist
    logger.info('Step 1: Creating database (if not exists)...');
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: null,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    logger.info(`✅ Database \`${dbName}\` ready\n`);
    await connection.end();

    // Step 2: Connect to database and sync models
    logger.info('Step 2: Connecting to database...');
    const sequelize = new Sequelize(dbName, dbUser, null, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    await sequelize.authenticate();
    logger.info('✅ Connected to database\n');

    // Step 3: Sync all models
    logger.info('Step 3: Creating tables...');
    await sequelize.sync({ alter: false, force: false });
    logger.info('✅ Tables synchronized\n');

    // Step 4: Verify tables were created
    logger.info('Step 4: Verifying tables...');
    const result = await sequelize.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      {
        replacements: [dbName],
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const tableNames = result.map((t) => t.TABLE_NAME);
    logger.info(`✅ Total tables created: ${tableNames.length}`);

    if (tableNames.length > 0) {
      logger.info('\n✅ Created tables:');
      tableNames.forEach((name) => {
        logger.info(`   - ${name}`);
      });
    }

    logger.info('\n🎉 Migration completed successfully!\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    console.error(error);
    if (connection) await connection.end();
    process.exit(1);
  }
};

migrateWithSequelize();
