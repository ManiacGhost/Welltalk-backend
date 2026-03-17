# Database Migration Guide

This guide explains how to set up and manage your MySQL database for the Welltalk backend.

## Option 1: Automatic Migration with Sequelize (Recommended)

### Quick Setup
```bash
npm run migrate
```

This command will:
- Connect to MySQL
- Create the database (if it doesn't exist)
- Create all tables with proper indexes and foreign keys
- Automatically handle the schema based on your models

### What It Does
- Creates `categories` table
- Creates `blogs` table with relationship to `categories`
- Creates `events` table
- Adds proper indexes for performance
- Sets up UUID/timestamps

---

## Option 2: Raw SQL Import

### Method A: Using migrate-raw.js Script
```bash
npm run migrate:raw
```

This will:
- Create the database automatically
- Execute all SQL statements in `schema.sql`
- Set up all tables and indexes

### Method B: Manual SQL Import

#### Using MySQL Command Line:
```bash
mysql -u root -p < schema.sql
```

#### Using MySQL Workbench:
1. Open MySQL Workbench
2. Go to **File → Run SQL Script**
3. Select `schema.sql` from the project root
4. Click **Run**

#### Using phpMyAdmin:
1. Open phpMyAdmin
2. Click **Import** tab
3. Select `schema.sql` file
4. Click **Go**

---

## Database Schema Overview

### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Blogs Table
```sql
CREATE TABLE blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content LONGTEXT NOT NULL,
  shortDescription TEXT,
  author VARCHAR(255) NOT NULL,
  categoryId INT (Foreign Key),
  featuredImage VARCHAR(255),
  readingTime INT,
  tags JSON,
  status ENUM('draft', 'published'),
  seoTitle VARCHAR(255),
  seoDescription TEXT,
  focusKeyword VARCHAR(255),
  publishedAt DATETIME,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);
```

### Events Table
```sql
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description LONGTEXT NOT NULL,
  eventDate DATETIME NOT NULL,
  eventTime TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  organizerName VARCHAR(255),
  ticketLink VARCHAR(500),
  coverImage VARCHAR(255),
  galleryImages JSON,
  status ENUM('upcoming', 'completed', 'cancelled'),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

---

## Seeding Initial Data

### Seed Sample Categories
```bash
node seeders/seed.js
```

This will insert sample categories:
- Health
- Medicine
- Wellness
- Data
- Lifestyle

---

## Migration Files Location

All Sequelize migration files are located in the `migrations/` directory:

- `migrations/001-create-category.js` - Creates categories table
- `migrations/002-create-blogs.js` - Creates blogs table with indexes
- `migrations/003-create-events.js` - Creates events table with indexes

## Full Database Reset

To completely reset the database (DROP all tables and recreate):

```bash
npm run db:reset
```

⚠️ **WARNING**: This will delete all data!

---

## Troubleshooting

### "Access denied for user 'root'"
- Check MySQL is running
- Update credentials in `.env` file
- Verify DB_USER and DB_PASSWORD are correct

### "Can't connect to MySQL server"
- Ensure MySQL is running on the correct host:port
- Check DB_HOST and DB_PORT in `.env`
- Default: localhost:3306

### "Table already exists"
- Tables can be safely re-created if they exist (CREATE TABLE IF NOT EXISTS)
- No data loss will occur unless using `--force` option

### Database not created automatically
- Check if you have CREATE DATABASE privilege
- The `migrate-raw.js` script creates the database
- Or manually create it with: `CREATE DATABASE welltalk;`

---

## Next Steps

1. ✅ Run migrations: `npm run migrate` or `npm run migrate:raw`
2. ✅ (Optional) Seed data: `node seeders/seed.js`
3. ✅ Start server: `npm run dev`
4. ✅ Test API endpoints

Your database is now ready to use!

---

## Development vs Production

### Development
- Migrations use `alter: true` - automatically alters existing tables
- Logging is enabled to see SQL queries
- `.env` should have development credentials

### Production
- Comment out `sequelize.sync()` in `src/config/database.js`
- Use only migrations in `migrations/` folder
- Set `NODE_ENV=production` in `.env`
- Disable logging by removing `logging: console.log`

---

## Entity Relationships

```
Categories (1) ──────────────── (Many) Blogs
    ↓
Regular Blog Posts with SEO optimization

Events (Independent)
    ↓
Event Management with Gallery Support
```

---

## Indexes Added for Performance

### Blogs Table Indexes:
- `idx_slug` - For fast slug lookups
- `idx_categoryId` - For category filtering
- `idx_status` - For filtering draft/published
- `idx_publishedAt` - For sorting by date

### Events Table Indexes:
- `idx_slug` - For fast slug lookups
- `idx_eventDate` - For sorting by event date
- `idx_status` - For filtering upcoming/completed

---

## Database Maintenance

### View Created Tables
```sql
SHOW TABLES;
```

### View Table Structure
```sql
DESCRIBE blogs;
DESCRIBE categories;
DESCRIBE events;
```

### Check Indexes
```sql
SHOW INDEX FROM blogs;
```

### Backup Database
```bash
mysqldump -u root -p welltalk > welltalk_backup.sql
```

### Restore from Backup
```bash
mysql -u root -p welltalk < welltalk_backup.sql
```
