require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('./src/utils/logger');

const migrateWithSequelize = async () => {
  let connection;
  try {
    logger.info('🔄 Starting database migration...\n');

    const dbName = process.env.DB_NAME || 'welltalk';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER || 'root';
    const password = (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim()) 
      ? process.env.DB_PASSWORD 
      : null;

    // Step 1: Create database if it doesn't exist
    logger.info('Step 1: Creating database (if not exists)...');
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: password,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    logger.info(`✅ Database \`${dbName}\` ready\n`);

    // Step 2: Switch to the target database
    logger.info('Step 2: Connecting to database...');
    await connection.query(`USE \`${dbName}\``);
    logger.info('✅ Connected to database\n');

    // Step 3: Create tables using raw SQL
    logger.info('Step 3: Creating tables...');

    // Create categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create blogs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content LONGTEXT NOT NULL,
        shortDescription TEXT,
        author VARCHAR(255),
        categoryId INT,
        featuredImage VARCHAR(255),
        readingTime INT,
        tags JSON,
        status ENUM('draft', 'published') DEFAULT 'draft',
        seoTitle VARCHAR(255),
        seoDescription TEXT,
        focusKeyword VARCHAR(255),
        publishedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_category (categoryId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description LONGTEXT NOT NULL,
        eventDate DATETIME NOT NULL,
        eventTime VARCHAR(50),
        location VARCHAR(255),
        organizerName VARCHAR(255),
        ticketLink VARCHAR(255),
        coverImage VARCHAR(255),
        galleryImages JSON,
        status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create contact_forms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_forms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        message LONGTEXT NOT NULL,
        status ENUM('pending', 'replied', 'closed') DEFAULT 'pending',
        emailSent BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    logger.info('✅ Tables created successfully\n');

    // Step 4: Verify tables were created
    logger.info('Step 4: Verifying tables...');
    const [rows] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    const tableNames = rows.map((t) => t.TABLE_NAME);
    logger.info(`✅ Total tables created: ${tableNames.length}`);

    if (tableNames.length > 0) {
      logger.info('\n✅ Created tables:');
      tableNames.forEach((name) => {
        logger.info(`   - ${name}`);
      });
    }

    logger.info('\n🎉 Migration completed successfully!\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    console.error(error);
    if (connection) await connection.end();
    process.exit(1);
  }
};

migrateWithSequelize();
