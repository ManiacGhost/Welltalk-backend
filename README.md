# Welltalk Backend

A Node.js backend application built with Express.js and MySQL using Sequelize ORM. This is a content management system for blogs and events.

## Project Structure

```
src/
├── config/        # Configuration files (database setup)
├── controllers/   # Route controllers (business logic)
├── middlewares/   # Express middlewares (auth, error handling)
├── models/        # Sequelize models (Blog, Category, Event)
├── routes/        # API routes
├── utils/         # Utility functions (logger, etc.)
└── index.js       # Main application file
tests/            # Test files
uploads/          # Directory for uploaded files
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update environment variables (especially MySQL credentials):
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=welltalk
   ```

5. Ensure MySQL is running and create the database (optional - Sequelize will create it)

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run format
```

## API Endpoints

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create new category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Blogs
- `GET /api/v1/blogs` - Get all blogs (with pagination and filters)
- `GET /api/v1/blogs/:id` - Get blog by ID or slug
- `POST /api/v1/blogs` - Create new blog (supports featured image upload)
- `PUT /api/v1/blogs/:id` - Update blog
- `DELETE /api/v1/blogs/:id` - Delete blog

**Query Parameters for GET /api/v1/blogs:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (draft, published)
- `categoryId` - Filter by category

### Events
- `GET /api/v1/events` - Get all events (with pagination)
- `GET /api/v1/events/:id` - Get event by ID or slug
- `POST /api/v1/events` - Create new event (supports cover image and gallery)
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event

**Query Parameters for GET /api/v1/events:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (upcoming, completed, cancelled)

## Database Schema

### Categories
- `id` - Primary key
- `name` - Category name
- `slug` - URL-friendly slug
- `description` - Category description
- `createdAt`, `updatedAt` - Timestamps

### Blogs
- `id` - Primary key
- `title` - Blog title
- `slug` - URL-friendly slug
- `content` - Blog content (HTML)
- `shortDescription` - Short description for preview
- `author` - Author name
- `categoryId` - Foreign key to Category
- `featuredImage` - Path to featured image
- `readingTime` - Estimated reading time in minutes
- `tags` - JSON array of tags
- `status` - draft or published
- `seoTitle`, `seoDescription`, `focusKeyword` - SEO fields
- `publishedAt` - Publication timestamp
- `createdAt`, `updatedAt` - Timestamps

### Events
- `id` - Primary key
- `title` - Event title
- `slug` - URL-friendly slug
- `description` - Event description
- `eventDate` - Event date
- `eventTime` - Event time
- `location` - Event location
- `organizerName` - Organizer name
- `ticketLink` - Link to purchase tickets
- `coverImage` - Path to cover image
- `galleryImages` - JSON array of gallery image paths
- `status` - upcoming, completed, or cancelled
- `createdAt`, `updatedAt` - Timestamps

## Dependencies

### Production
- **express**: Web framework
- **mysql2**: MySQL driver
- **sequelize**: ORM for database operations
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Security middleware
- **morgan**: HTTP request logger
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **joi**: Data validation
- **express-validator**: Express validation middleware
- **multer**: File upload middleware

### Development
- **nodemon**: Auto-restart on file changes
- **jest**: Testing framework
- **supertest**: HTTP assertions
- **eslint**: Linting
- **prettier**: Code formatting

## File Uploads

Files are uploaded to the `uploads/` directory and served statically:
- Blog featured images: `/uploads/blogs/`
- Event images: `/uploads/events/`

Supported formats: JPEG, PNG, WebP
Max file size: 10MB

## Environment Variables

See `.env.example` for all required environment variables. Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `DB_*` - MySQL connection details
- `JWT_SECRET` - JWT secret key
- `CORS_ORIGIN` - Allowed origin for CORS

## License

ISC
