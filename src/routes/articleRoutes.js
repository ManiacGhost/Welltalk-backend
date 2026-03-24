const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/blogs/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Validation middleware for articles (same as blogs but with flag_category = 'ARTICLE')
const validateArticle = [
  body('title')
    .notEmpty()
    .withMessage('Article title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('content').notEmpty().withMessage('Article content is required'),
  body('shortDescription').optional().isString().withMessage('Short description must be a string'),
  body('author').notEmpty().withMessage('Author is required'),
  body('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
  body('readingTime').optional().isInt().withMessage('Reading time must be an integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
];

// Routes
// GET /api/v1/articles - Get all articles (flag_category = 'ARTICLE')
router.get('/', blogController.getAllBlogs);

// GET /api/v1/articles/:id - Get article by ID (flag_category = 'ARTICLE')
router.get('/:id', blogController.getBlogById);

// POST /api/v1/articles - Create new article (flag_category = 'ARTICLE')
router.post(
  '/',
  upload.single('featuredImage'),
  validateArticle,
  (req, res, next) => {
    // Set flag_category to ARTICLE for articles
    req.body.flag_category = 'ARTICLE';
    next();
  },
  blogController.createBlog
);

// PUT /api/v1/articles/:id - Update article (flag_category = 'ARTICLE')
router.put(
  '/:id',
  upload.single('featuredImage'),
  validateArticle,
  (req, res, next) => {
    // Set flag_category to ARTICLE for articles
    req.body.flag_category = 'ARTICLE';
    next();
  },
  blogController.updateBlog
);

// DELETE /api/v1/articles/:id - Delete article (flag_category = 'ARTICLE')
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
