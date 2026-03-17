require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const logger = require('./src/utils/logger');

const runMigration = async () => {
  let connection;
  try {
    logger.info('Connecting to MySQL...');

    // Create connection to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    logger.info('✅ Connected to MySQL');

    const dbName = process.env.DB_NAME || 'welltalk';

    // Create database if it doesn't exist
    logger.info(`Creating database: ${dbName}`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    logger.info(`✅ Database ${dbName} ready`);

    // Switch to the database
    await connection.changeUser({ database: dbName });
    logger.info(`✅ Switched to database ${dbName}`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      logger.info(`Executing: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
    }

    logger.info('✅ All tables created successfully!');
    logger.info('🎉 Migration completed!');

    await connection.end();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
};

runMigration();
