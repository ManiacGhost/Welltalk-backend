const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/blogs/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Validation middleware
const validateBlog = [
  body('title')
    .notEmpty()
    .withMessage('Blog title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('content').notEmpty().withMessage('Blog content is required'),
  body('author').notEmpty().withMessage('Author name is required'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
  body('readingTime').optional().isInt({ min: 1 }).withMessage('Reading time must be a positive number'),
];

// Routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', upload.single('featuredImage'), validateBlog, blogController.createBlog);
router.put('/:id', upload.single('featuredImage'), validateBlog, blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
