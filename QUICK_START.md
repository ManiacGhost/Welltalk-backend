# Quick Setup Checklist

## 🚀 Getting Started with Migrations

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Database
Update `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=welltalk
```

### Step 3: Run Database Migration

**Option A - Automatic with Sequelize (Recommended):**
```bash
npm run migrate
```

**Option B - Raw SQL Import:**
```bash
npm run migrate:raw
```

**Option C - Direct SQL File:**
```bash
mysql -u root -p < schema.sql
```

### Step 4: (Optional) Seed Sample Data
```bash
npm run db:reset
```

### Step 5: Start the Server
```bash
npm run dev
```

---

## 📋 Database Structure Summary

| Table | Records | Purpose |
|-------|---------|---------|
| categories | Blog categories | Organize blogs by type |
| blogs | Blog posts | Content with SEO fields |
| events | Events | Manage wellness events |

---

## 🔧 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run migrate` | Create tables using Sequelize |
| `npm run migrate:raw` | Create tables from SQL schema |
| `npm run db:reset` | Drop + recreate + seed all tables |
| `npm run dev` | Start development server |
| `npm run start` | Start production server |

---

## 📊 Generated Database Files

- **schema.sql** - Complete MySQL schema that can be directly imported
- **migrations/** - Sequelize migration files for version control
- **seeders/** - Sample data seeders
- **migrate.js** - Sequelize migration script
- **migrate-raw.js** - Raw SQL migration script

---

## ✅ Verification

After running migrations, verify tables were created:

```bash
mysql -u root -p
```

```sql
use welltalk;
show tables;
describe categories;
describe blogs;
describe events;
```

Expected output:
```
+----+-------+
| Tables_in_welltalk |
+----+-------+
| blogs              |
| categories         |
| events             |
+----+-------+
```

---

## 🎯 What Gets Created

### 1. Categories Table
- Store blog categories (Health, Wellness, etc.)
- 1-to-Many relationship with blogs

### 2. Blogs Table
- Full blog management with SEO fields
- Support for featured images
- Draft/Published status
- Tags as JSON array
- Auto-timestamping

### 3. Events Table
- Event management system
- Support for cover image + gallery
- Event date/time tracking
- Status tracking (upcoming/completed/cancelled)

---

## 🔐 Data Integrity Features

✅ Foreign key constraints between blogs and categories  
✅ Unique slugs for clean URLs  
✅ Indexes on frequently queried columns  
✅ Proper data types (LONGTEXT for content, JSON for arrays)  
✅ Cascading updates and delete rules  

---

## 💡 Tips

- Use `npm run migrate` for development (auto-alters tables)
- Use `npm run migrate:raw` for production-like setup
- Always backup before running `db:reset`
- Check MIGRATION_GUIDE.md for detailed information
- Import `schema.sql` directly if you prefer GUI tools

---

## 🐛 Troubleshooting

See MIGRATION_GUIDE.md for common issues and solutions.

---

## Next Steps

1. ✅ Run migrations
2. ✅ Start the server
3. ✅ Test API endpoints:
   - GET `/api/v1/categories`
   - GET `/api/v1/blogs`
   - GET `/api/v1/events`

Your database is ready! 🎉
